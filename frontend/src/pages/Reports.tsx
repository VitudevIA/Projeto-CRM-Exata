import { useEffect, useState } from "react";
import api from "@/services/api";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { Download } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("conversion");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split("T")[0]);
    setDateTo(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadReport();
    }
  }, [reportType, dateFrom, dateTo]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${reportType}`, {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
        },
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "excel") => {
    try {
      // Implementar exportação
      alert(`Exportação ${format.toUpperCase()} será implementada`);
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  const renderConversionReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Taxa de Conversão por Estágio
          </h3>
          <div className="space-y-3">
            {reportData.conversion_rates?.map((rate: any) => (
              <div key={rate.stage_id} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{rate.stage_name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 dark:text-gray-400">{rate.count} clientes</span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${rate.rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                    {rate.rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProductivityReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Produtividade por Operador
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Operador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total de Chamadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Duração Média
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Chamadas/Hora
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.productivity?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.operator_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.total_calls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor(item.avg_duration / 60)}:{(item.avg_duration % 60).toString().padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.calls_per_hour}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderLossReasonsReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Análise de Motivos de Perda
          </h3>
          <div className="space-y-3">
            {reportData.loss_analysis?.map((item: any) => (
              <div key={item.reason_id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.reason}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-4 ml-4">
                  <span className="text-gray-600 dark:text-gray-400">{item.count} perdas</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTabulationReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição de Tabulação
          </h3>
          <div className="space-y-3">
            {reportData.tabulation?.map((item: any) => (
              <div key={item.tabulation} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{item.tabulation}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600 dark:text-gray-400">{item.count} chamadas</span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Análise de performance e conversão
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Tipo de Relatório"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: "conversion", label: "Conversão" },
              { value: "productivity", label: "Produtividade" },
              { value: "loss-reasons", label: "Motivos de Perda" },
              { value: "tabulation", label: "Tabulação" },
            ]}
          />
          <Input
            label="Data Inicial"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <Input
            label="Data Final"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          <div className="flex items-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => handleExport("excel")}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport("pdf")}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Carregando relatório...</div>
        </div>
      ) : (
        <>
          {reportType === "conversion" && renderConversionReport()}
          {reportType === "productivity" && renderProductivityReport()}
          {reportType === "loss-reasons" && renderLossReasonsReport()}
          {reportType === "tabulation" && renderTabulationReport()}
        </>
      )}
    </div>
  );
}

