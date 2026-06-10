import React from "react";
import { AgendaGroupedList } from "./AgendaGroupedList";
import { AgendaHeader } from "./AgendaHeader";
import { AgendaItemForm } from "./AgendaItemForm";
import type {
  AgendaCreatePayload,
  AgendaItem,
  AgendaOrderOption,
  AgendaSummary,
} from "./types";
import { ConfirmModal, Toast } from "../../components";
import {
  defaultAgendaFilters,
  useAgendaItems,
  useConfirmModal,
  useToast,
} from "../../hooks";
import { ordersService } from "../../services";
import { isoDateStringToLocalDate } from "../../utils";

const isToday = (value: string | null): boolean => {
  const date = isoDateStringToLocalDate(value);
  if (!date) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const isOverdue = (item: AgendaItem): boolean => {
  const date = isoDateStringToLocalDate(item.due_date);
  if (!date || item.status !== "pending") return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return date < today;
};

export const AgendaPage: React.FC = () => {
  const [filters, setFilters] = React.useState(defaultAgendaFilters);
  const [orders, setOrders] = React.useState<AgendaOrderOption[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<AgendaItem | null>(null);
  const {
    items,
    loading,
    createAgendaItem,
    updateAgendaItem,
    completeAgendaItem,
    archiveAgendaItem,
    deleteAgendaItem,
  } = useAgendaItems(filters);

  const {
    isOpen: isConfirmOpen,
    config: confirmConfig,
    openConfirm,
    closeConfirm,
  } = useConfirmModal();
  const {
    isVisible: isToastVisible,
    config: toastConfig,
    hideToast,
    showSuccess,
    showError,
  } = useToast();

  React.useEffect(() => {
    ordersService
      .getAllOrders()
      .then((response) => setOrders(response))
      .catch((error) => {
        console.error("Error fetching orders for agenda:", error);
        setOrders([]);
      });
  }, []);

  const summary: AgendaSummary = React.useMemo(
    () => ({
      pendingToday: items.filter(
        (item) => item.status === "pending" && isToday(item.due_date)
      ).length,
      overdue: items.filter(isOverdue).length,
      linkedToOrders: items.filter((item) => item.order_id !== null).length,
    }),
    [items]
  );

  const openCreateItem = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const openEditItem = (item: AgendaItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (data: AgendaCreatePayload) => {
    try {
      if (selectedItem) {
        await updateAgendaItem(selectedItem.id, data);
        showSuccess("Item actualizado");
      } else {
        await createAgendaItem(data);
        showSuccess("Item creado");
      }
      closeForm();
    } catch (error) {
      console.error("Error saving agenda item:", error);
      showError(
        selectedItem ? "Error al actualizar el item" : "Error al crear el item"
      );
      throw error;
    }
  };

  const handleComplete = async (item: AgendaItem) => {
    try {
      await completeAgendaItem(item.id);
      showSuccess("Item completado");
    } catch (error) {
      console.error("Error completing agenda item:", error);
      showError("Error al completar el item");
    }
  };

  const handleArchive = async (item: AgendaItem) => {
    try {
      await archiveAgendaItem(item.id);
      showSuccess("Item archivado");
    } catch (error) {
      console.error("Error archiving agenda item:", error);
      showError("Error al archivar el item");
    }
  };

  const handleDelete = (item: AgendaItem) => {
    openConfirm({
      title: "Eliminar item",
      message: `¿Estás seguro de que deseas eliminar "${item.title}"?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteAgendaItem(item.id);
          showSuccess("Item eliminado");
        } catch (error) {
          console.error("Error deleting agenda item:", error);
          showError("Error al eliminar el item");
        }
      },
    });
  };

  return (
    <div className="py-2">
      <AgendaHeader
        summary={summary}
        filters={filters}
        setFilters={setFilters}
        orders={orders}
        openCreateItem={openCreateItem}
      />
      <AgendaGroupedList
        items={items}
        loading={loading}
        status={filters.status}
        onEdit={openEditItem}
        onComplete={handleComplete}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
      <AgendaItemForm
        isOpen={isFormOpen}
        selectedItem={selectedItem}
        orders={orders}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
      {confirmConfig && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={closeConfirm}
          {...confirmConfig}
        />
      )}
      <Toast isVisible={isToastVisible} onClose={hideToast} {...toastConfig} />
    </div>
  );
};
