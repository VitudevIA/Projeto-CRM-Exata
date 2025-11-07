import { useState } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Button from "./ui/Button";

interface CreditSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialClientId?: string;
}

export default function CreditSimulator({ isOpen, onClose }: CreditSimulatorProps) {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [installments, setInstallments] = useState("");
  const [result, setResult] = useState<{ installmentValue: number; totalAmount: number } | null>(null);

  const calculate = () => {
    const amount = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100;
    const numInstallments = parseInt(installments);

    if (!amount || !rate || !numInstallments || amount <= 0 || rate <= 0 || numInstallments <= 0) {
      setResult(null);
      return;
    }

    // Cálculo de juros compostos (Sistema Price)
    const monthlyRate = rate / 12;
    const installmentValue = amount * (monthlyRate * Math.pow(1 + monthlyRate, numInstallments)) / (Math.pow(1 + monthlyRate, numInstallments) - 1);
    const totalAmount = installmentValue * numInstallments;

    setResult({
      installmentValue,
      totalAmount,
    });
  };

  const handleClose = () => {
    setLoanAmount("");
    setInterestRate("");
    setInstallments("");
    setResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Simulador de Crédito" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Valor do Empréstimo (R$)"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <Input
            label="Taxa de Juros (% a.m.)"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <Input
            label="Número de Parcelas"
            type="number"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            placeholder="0"
            min="1"
            step="1"
          />
        </div>

        <Button onClick={calculate} className="w-full">
          Calcular
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Resultado da Simulação
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valor da Parcela:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  R$ {result.installmentValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total a Pagar:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  R$ {result.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-800">
                <span className="text-gray-600 dark:text-gray-400">Total de Juros:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  R$ {(result.totalAmount - parseFloat(loanAmount)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

