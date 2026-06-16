import React from "react";
import { CreateIncomeForm } from "./CreateIncomeForm";
import type { Income, IncomeFormData } from "./types";

export const IncomesHeader: React.FC<{
  isOpen: boolean;
  selectedIncome?: Income | null;
  createIncome: (data: IncomeFormData) => Promise<unknown>;
  updateIncome: (incomeId: number, data: IncomeFormData) => Promise<unknown>;
  onDeleteIncome: (income: Income) => void;
  toggleModal: () => void;
  openCreateIncome: () => void;
  canWrite: boolean;
  canManage: boolean;
}> = ({ 
  createIncome, 
  updateIncome, 
  onDeleteIncome,
  isOpen, 
  toggleModal, 
  selectedIncome, 
  openCreateIncome,
  canWrite,
  canManage,
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
        
        {canWrite && (
          <CreateIncomeForm
            isOpen={isOpen}
            selectedIncome={selectedIncome}
            createIncome={createIncome}
            updateIncome={updateIncome}
            onDeleteIncome={onDeleteIncome}
            toggleModal={toggleModal}
            openCreateIncome={openCreateIncome}
            canDelete={canManage}
          />
        )}
      </div>
    </header>
  );
};
