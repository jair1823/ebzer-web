import React, { useState } from "react";
import { useIncomes } from "../../hooks";
import { IncomesHeader } from "./IncomesHeader";
import { IncomesTable } from "./IncomesTable";
import type { Income } from "./types";

export const IncomesPage: React.FC = () => {
  const { 
    incomes, 
    loading, 
    createIncome, 
    updateIncome, 
    selectedIncome, 
    setSelectedIncome 
  } = useIncomes();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    if (isModalOpen) {
      setSelectedIncome(null);
    }
    setIsModalOpen(!isModalOpen);
  };

  const openCreateIncome = () => {
    setSelectedIncome(null);
    setIsModalOpen(true);
  };

  const handleSelectIncome = (income: Income) => {
    setSelectedIncome(income);
    setIsModalOpen(true);
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <IncomesHeader
          isOpen={isModalOpen}
          selectedIncome={selectedIncome}
          createIncome={createIncome}
          updateIncome={updateIncome}
          toggleModal={toggleModal}
          openCreateIncome={openCreateIncome}
        />

        <IncomesTable
          incomes={incomes}
          loading={loading}
          onSelectIncome={handleSelectIncome}
        />
      </div>
    </div>
  );
};
