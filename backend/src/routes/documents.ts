import { Router, Response } from "express";
import multer from "multer";
import { supabaseAdmin } from "../config/supabase.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import { requireTenant } from "../middleware/tenant.js";
import { compressDocument } from "../utils/document-compression.js";
import { createAuditLog } from "../services/audit.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

// Configurar multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,application/pdf").split(",");
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  },
});

// Upload de documento
router.post("/upload", upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não fornecido" });
    }

    const { client_id, document_type } = req.body;

    if (!client_id || !document_type) {
      return res.status(400).json({ error: "client_id e document_type são obrigatórios" });
    }

    // Verificar acesso ao cliente
    let clientQuery = supabaseAdmin
      .from("clients")
      .select("id")
      .eq("id", client_id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      clientQuery = clientQuery.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { error: clientError } = await clientQuery;
    if (clientError) {
      return res.status(404).json({ error: "Cliente não encontrado ou sem acesso" });
    }

    // Comprimir documento
    const compressionResult = await compressDocument(
      req.file.buffer,
      req.file.mimetype,
      {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 80,
        format: "webp",
      }
    );

    // Gerar nome único para o arquivo
    const fileExtension = compressionResult.mimeType.includes("pdf") ? "pdf" : "webp";
    const fileName = `${client_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `documents/${req.user!.tenant_id}/${fileName}`;

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, compressionResult.buffer, {
        contentType: compressionResult.mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
    }

    // Obter URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from("documents")
      .getPublicUrl(filePath);

    // Salvar registro no banco
    const { data: document, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        tenant_id: req.user!.tenant_id,
        client_id,
        document_type,
        file_name: req.file.originalname,
        file_path: filePath,
        file_size: compressionResult.compressedSize,
        mime_type: compressionResult.mimeType,
        uploaded_by: req.user!.id,
      })
      .select()
      .single();

    if (dbError) {
      // Rollback: deletar arquivo do storage
      await supabaseAdmin.storage.from("documents").remove([filePath]);
      throw dbError;
    }

    // Criar histórico
    await supabaseAdmin.from("client_history").insert({
      tenant_id: req.user!.tenant_id,
      client_id,
      interaction_type: "document_upload",
      title: "Documento enviado",
      description: `Documento ${document_type} enviado: ${req.file.originalname}`,
      metadata: {
        document_id: document.id,
        file_name: req.file.originalname,
        file_size: compressionResult.compressedSize,
      },
      created_by: req.user!.id,
    });

    await createAuditLog(req, "create", "document", document.id);

    res.status(201).json({
      ...document,
      url: urlData.publicUrl,
      compression: {
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        ratio: ((compressionResult.originalSize - compressionResult.compressedSize) / compressionResult.originalSize * 100).toFixed(2),
      },
    });
  } catch (error: any) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Erro ao fazer upload do documento" });
  }
});

// Listar documentos de um cliente
router.get("/client/:client_id", async (req: AuthRequest, res: Response) => {
  try {
    const { client_id } = req.params;

    // Verificar acesso ao cliente
    let clientQuery = supabaseAdmin
      .from("clients")
      .select("id")
      .eq("id", client_id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (req.user!.role === "funcionario") {
      clientQuery = clientQuery.or(`assigned_to.eq.${req.user!.id},created_by.eq.${req.user!.id}`);
    }

    const { error: clientError } = await clientQuery;
    if (clientError) {
      return res.status(404).json({ error: "Cliente não encontrado ou sem acesso" });
    }

    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*, uploaded_by_user:users!documents_uploaded_by_fkey(id, full_name)")
      .eq("client_id", client_id)
      .eq("tenant_id", req.user!.tenant_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Adicionar URLs públicas
    const documentsWithUrls = (data || []).map((doc) => {
      const { data: urlData } = supabaseAdmin.storage
        .from("documents")
        .getPublicUrl(doc.file_path);

      return {
        ...doc,
        url: urlData.publicUrl,
      };
    });

    res.json(documentsWithUrls);
  } catch (error: any) {
    console.error("Error listing documents:", error);
    res.status(500).json({ error: "Erro ao listar documentos" });
  }
});

// Download de documento
router.get("/:id/download", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: document, error } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (error || !document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    // Verificar acesso ao cliente
    if (req.user!.role === "funcionario") {
      const { data: client } = await supabaseAdmin
        .from("clients")
        .select("id, assigned_to, created_by")
        .eq("id", document.client_id)
        .single();

      if (!client || (client.assigned_to !== req.user!.id && client.created_by !== req.user!.id)) {
        return res.status(403).json({ error: "Acesso negado" });
      }
    }

    // Download do arquivo
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("documents")
      .download(document.file_path);

    if (downloadError || !fileData) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    // Converter para buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", document.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${document.file_name}"`);
    res.send(buffer);

    await createAuditLog(req, "view", "document", id);
  } catch (error: any) {
    console.error("Error downloading document:", error);
    res.status(500).json({ error: "Erro ao baixar documento" });
  }
});

// Deletar documento
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: document, error: fetchError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", req.user!.tenant_id)
      .single();

    if (fetchError || !document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    // Verificar acesso
    if (req.user!.role === "funcionario" && document.uploaded_by !== req.user!.id) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Deletar do storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("documents")
      .remove([document.file_path]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
    }

    // Deletar do banco
    const { error: dbError } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    await createAuditLog(req, "delete", "document", id);

    res.json({ message: "Documento deletado com sucesso" });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Erro ao deletar documento" });
  }
});

export default router;

