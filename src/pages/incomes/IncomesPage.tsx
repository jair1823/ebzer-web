import React, { useState } from "react";
import { useConfirmModal, useIncomes, useToast } from "../../hooks";
import { IncomesHeader } from "./IncomesHeader";
import { IncomesTable } from "./IncomesTable";
import type { Income } from "./types";
import { canManageIncomes, canWriteBusinessRecords, useAuth } from "../../auth";
import { ConfirmModal, Toast } from "../../components";

export const IncomesPage: React.FC = () => {
  const { user } = useAuth();
  const writeAllowed = user ? canWriteBusinessRecords(user.role) : false;
  const manageAllowed = user ? canManageIncomes(user.role) : false;
  const { 
    incomes, 
    loading, 
    createIncome, 
    updateIncome, 
    deleteIncome,
    selectedIncome, 
    setSelectedIncome 
  } = useIncomes();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isOpen: isConfirmOpen, config: confirmConfig, openConfirm, closeConfirm } = useConfirmModal();
  const { isVisible: isToastVisible, config: toastConfig, hideToast, showSuccess, showError } = useToast();

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
    if (!manageAllowed) return;
    setSelectedIncome(income);
    setIsModalOpen(true);
  };

  const handleDeleteIncome = (income: Income) => {
    if (!manageAllowed) return;

    openConfirm({
      title: "Eliminar ingreso",
      message: `¿Estás seguro de que deseas eliminar el ingreso #${income.id}? Esta acción afectará el total pagado del pedido #${income.order_id}.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteIncome(income.id);
          showSuccess(`Ingreso #${income.id} eliminado`);
          if (selectedIncome?.id === income.id) {
            setSelectedIncome(null);
            setIsModalOpen(false);
          }
        } catch (err: unknown) {
          showError((err as { message?: string })?.message ?? "Error al eliminar el ingreso");
        }
      },
    });
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <IncomesHeader
          isOpen={isModalOpen}
          selectedIncome={selectedIncome}
          createIncome={createIncome}
          updateIncome={updateIncome}
          onDeleteIncome={handleDeleteIncome}
          toggleModal={toggleModal}
          openCreateIncome={openCreateIncome}
          canWrite={writeAllowed}
          canManage={manageAllowed}
        />

        <IncomesTable
          incomes={incomes}
          loading={loading}
          onSelectIncome={handleSelectIncome}
          onDeleteIncome={handleDeleteIncome}
          canManage={manageAllowed}
        />

        {confirmConfig && (
          <ConfirmModal isOpen={isConfirmOpen} onClose={closeConfirm} {...confirmConfig} />
        )}

        <Toast isVisible={isToastVisible} onClose={hideToast} {...toastConfig} />
      </div>
    </div>
  );
};
