import { useState, useRef } from "react";
import api from "@/services/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Fazer preview
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/import/preview", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPreview(response.data);
      setIsPreviewModalOpen(true);
    } catch (error: any) {
      console.error("Error previewing file:", error);
      toast.error(error.response?.data?.error || "Erro ao fazer preview do arquivo");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/import/leads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setImportResults(response.data.results);
      setIsPreviewModalOpen(false);
      toast.success(response.data.message);
    } catch (error: any) {
      console.error("Error importing:", error);
      toast.error(error.response?.data?.error || "Erro ao importar arquivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Importação em Massa
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Importe leads via arquivo CSV ou Excel
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Selecione um arquivo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              CSV ou Excel (máx. 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Selecionar Arquivo
            </Button>
            {file && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {importResults && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Resultado da Importação
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {importResults.total}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResults.created}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Criados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {importResults.updated}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Atualizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {importResults.skipped}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Ignorados</div>
                </div>
              </div>
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Erros:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {importResults.errors.map((error: any, index: number) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400">
                        Linha {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setFile(null);
          setPreview(null);
        }}
        title="Preview da Importação"
        size="xl"
      >
        {preview && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Total de linhas:</strong> {preview.total_rows}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                <strong>Colunas detectadas:</strong> {preview.columns.join(", ")}
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                  <tr>
                    {preview.columns.map((col: string) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {preview.preview.map((row: any, index: number) => (
                    <tr key={index}>
                      {preview.columns.map((col: string) => (
                        <td
                          key={col}
                          className="px-4 py-2 text-sm text-gray-900 dark:text-white"
                        >
                          {row.data[col] || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setFile(null);
                  setPreview(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleImport} isLoading={loading}>
                Confirmar Importação
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

