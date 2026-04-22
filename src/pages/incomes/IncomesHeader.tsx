import React from "react";
import { CreateIncomeForm } from "./CreateIncomeForm";
import type { Income, IncomeFormData } from "./types";

export const IncomesHeader: React.FC<{
  isOpen: boolean;
  selectedIncome?: Income | null;
  createIncome: (data: IncomeFormData) => Promise<void>;
  updateIncome: (incomeId: number, data: IncomeFormData) => Promise<void>;
  toggleModal: () => void;
  openCreateIncome: () => void;
}> = ({ 
  createIncome, 
  updateIncome, 
  isOpen, 
  toggleModal, 
  selectedIncome, 
  openCreateIncome 
}) => {
  return (
    <header className="mb-6 overflow-hidden rounded-xl shadow-sm surface-card">
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            Ingresos
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Gestiona los pagos recibidos de tus pedidos
          </p>
        </div>
        
        <CreateIncomeForm
          isOpen={isOpen}
          selectedIncome={selectedIncome}
          createIncome={createIncome}
          updateIncome={updateIncome}
          toggleModal={toggleModal}
          openCreateIncome={openCreateIncome}
        />
      </div>
    </header>
  );
};
