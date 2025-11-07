import { Router, Response } from "express";
import multer from "multer";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { validateCPF } from "../utils/validation.js";
import { createAuditLog } from "../services/audit.js";
import * as XLSX from "xlsx";
import csv from "csv-parser";
import { Readable } from "stream";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith(".csv") || file.originalname.endsWith(".xlsx") || file.originalname.endsWith(".xls")) {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos CSV ou Excel são permitidos"));
    }
  },
});

// Importar leads em massa
router.post("/leads", upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não fornecido" });
    }

    let rows: any[] = [];

    // Processar arquivo
    if (req.file.mimetype === "text/csv" || req.file.originalname.endsWith(".csv")) {
      // Processar CSV
      rows = await new Promise((resolve, reject) => {
        const results: any[] = [];
        const stream = Readable.from(req.file!.buffer);
        
        stream
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => resolve(results))
          .on("error", reject);
      });
    } else {
      // Processar Excel
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: "Arquivo vazio ou formato inválido" });
    }

    // Buscar estágio inicial
    const { data: leadStage } = await supabaseAdmin
      .from("client_stages")
      .select("id")
      .eq("tenant_id", req.user!.tenant_id)
      .eq("stage_type", "lead")
      .single();

    const results = {
      total: rows.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    // Processar cada linha
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Mapear colunas (flexível)
        const cpf = (row.cpf || row.CPF || row["CPF"] || "").toString().replace(/\D/g, "");
        const name = (row.name || row.nome || row.Nome || row["Nome"] || "").toString().trim();
        const phone = (row.phone || row.telefone || row.Telefone || row["Telefone"] || "").toString().replace(/\D/g, "");
        const email = (row.email || row.Email || row["Email"] || "").toString().trim();
        const leadSource = (row.lead_source || row.origem || row.Origem || row["Origem"] || "importacao").toString().trim();

        // Validações
        if (!cpf || !validateCPF(cpf)) {
          results.skipped++;
          results.errors.push({ row: i + 1, error: "CPF inválido ou ausente" });
          continue;
        }

        if (!name || name.length < 3) {
          results.skipped++;
          results.errors.push({ row: i + 1, error: "Nome inválido ou ausente" });
          continue;
        }

        if (!phone || phone.length < 10) {
          results.skipped++;
          results.errors.push({ row: i + 1, error: "Telefone inválido ou ausente" });
          continue;
        }

        // Verificar se cliente já existe
        const { data: existing } = await supabaseAdmin
          .from("clients")
          .select("id")
          .eq("tenant_id", req.user!.tenant_id)
          .eq("cpf", cpf)
          .single();

        if (existing) {
          // Atualizar cliente existente
          await supabaseAdmin
            .from("clients")
            .update({
              name,
              phone,
              email: email || null,
              lead_source: leadSource,
              updated_by: req.user!.id,
            })
            .eq("id", existing.id);

          results.updated++;
        } else {
          // Criar novo cliente
          await supabaseAdmin.from("clients").insert({
            tenant_id: req.user!.tenant_id,
            cpf,
            name,
            phone,
            email: email || null,
            is_whatsapp: false,
            lead_source: leadSource,
            current_stage_id: leadStage?.id || null,
            status: "ativo",
            created_by: req.user!.id,
          });

          results.created++;
        }
      } catch (error: any) {
        results.skipped++;
        results.errors.push({ row: i + 1, error: error.message || "Erro desconhecido" });
      }
    }

    await createAuditLog(req, "create", "import", undefined, null, {
      type: "leads",
      results,
    });

    res.json({
      success: true,
      message: `Importação concluída: ${results.created} criados, ${results.updated} atualizados, ${results.skipped} ignorados`,
      results,
    });
  } catch (error: any) {
    console.error("Error importing leads:", error);
    res.status(500).json({ error: "Erro ao importar leads" });
  }
});

// Preview do arquivo antes de importar
router.post("/preview", upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não fornecido" });
    }

    let rows: any[] = [];

    // Processar arquivo
    if (req.file.mimetype === "text/csv" || req.file.originalname.endsWith(".csv")) {
      rows = await new Promise((resolve, reject) => {
        const results: any[] = [];
        const stream = Readable.from(req.file!.buffer);
        
        stream
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => resolve(results))
          .on("error", reject);
      });
    } else {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    }

    // Retornar preview (primeiras 10 linhas)
    const preview = rows.slice(0, 10).map((row, index) => ({
      row: index + 1,
      data: row,
    }));

    res.json({
      total_rows: rows.length,
      preview,
      columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    });
  } catch (error: any) {
    console.error("Error previewing file:", error);
    res.status(500).json({ error: "Erro ao fazer preview do arquivo" });
  }
});

export default router;

