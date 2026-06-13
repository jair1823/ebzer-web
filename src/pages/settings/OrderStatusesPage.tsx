import React from "react";
import { Check, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import type { OrderStatusOption } from "../orders/types";
import { orderStatusesService } from "../../services";
import { StatusBadge } from "../../components";
import { StatusFormModal } from "./StatusFormModal";
import { ConfirmModal } from "../../components";
import { useConfirmModal } from "../../hooks";
import { Toast } from "../../components";
import { useToast } from "../../hooks";
import { canManageOrderStatuses, useAuth } from "../../auth";

export const OrderStatusesPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user ? canManageOrderStatuses(user.role) : false;
  const [statuses, setStatuses] = React.useState<OrderStatusOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showInactive, setShowInactive] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStatus, setEditingStatus] = React.useState<OrderStatusOption | null>(null);

  const { isOpen: isConfirmOpen, config: confirmConfig, openConfirm, closeConfirm } = useConfirmModal();
  const { isVisible: isToastVisible, config: toastConfig, hideToast, showSuccess, showError } = useToast();

  const loadStatuses = React.useCallback(async () => {
    setLoading(true);
    try {
      const all = await orderStatusesService.getAll();
      setStatuses(all.sort((a, b) => a.order_position - b.order_position));
    } catch {
      showError("Error al cargar los estados");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  React.useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const openCreateModal = () => {
    setEditingStatus(null);
    setIsModalOpen(true);
  };

  const openEditModal = (status: OrderStatusOption) => {
    setEditingStatus(status);
    setIsModalOpen(true);
  };

  const handleDeactivate = (status: OrderStatusOption) => {
    openConfirm({
      title: "Desactivar estado",
      message: `¿Estás seguro de que deseas desactivar "${status.display_name}"? Los pedidos existentes con este estado no se verán afectados, pero no podrás asignarlo a nuevos pedidos.`,
      confirmText: "Desactivar",
      cancelText: "Cancelar",
      variant: "warning",
      onConfirm: async () => {
        try {
          await orderStatusesService.deactivate(status.id);
          showSuccess(`Estado "${status.display_name}" desactivado`);
          await loadStatuses();
        } catch (err: unknown) {
          showError((err as { message?: string })?.message ?? "Error al desactivar el estado");
        }
      },
    });
  };

  const displayedStatuses = showInactive
    ? statuses
    : statuses.filter((s) => s.is_active);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Estados de pedido</h1>
          <p className="mt-1 text-sm text-secondary">
            Gestiona los estados disponibles para clasificar tus pedidos.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-base btn-secondary rounded-md text-sm px-4 py-2"
          >
            <Plus size={14} strokeWidth={2.5} aria-hidden="true" className="mr-1.5" />
            Agregar estado
          </button>
        )}
      </div>

      {/* Show inactive toggle */}
      <div className="flex items-center gap-2 mb-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-secondary select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Mostrar estados inactivos
        </label>
      </div>

      {/* Status list */}
      <div className="overflow-hidden rounded-xl shadow-sm surface-card">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-secondary">Cargando estados...</p>
        ) : displayedStatuses.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-secondary">No hay estados disponibles.</p>
        ) : (
          <ul className="divide-y divide-subtle">
            {displayedStatuses.map((status) => (
              <li
                key={status.id}
                className={`flex items-center gap-4 px-5 py-4 ${!status.is_active ? "opacity-50" : ""}`}
              >
                {/* Color chip */}
                <span
                  className="h-4 w-4 rounded-full flex-shrink-0 border border-subtle"
                  style={{ backgroundColor: status.color }}
                  aria-hidden="true"
                />

                {/* Name info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge color={status.color} label={status.display_name} size="sm" />
                    <span className="text-xs text-tertiary font-mono">{status.name}</span>
                    {status.is_system_status && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-subtle px-2 py-0.5 text-xs text-secondary font-medium">
                        <Lock size={12} strokeWidth={2} aria-hidden="true" />
                        Sistema
                      </span>
                    )}
                    {status.is_final_status && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-subtle px-2 py-0.5 text-xs text-secondary font-medium">
                        <Check size={12} strokeWidth={2} aria-hidden="true" />
                        Final
                      </span>
                    )}
                    {!status.is_active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-tertiary font-medium">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Position badge */}
                <span className="text-xs text-tertiary tabular-nums w-5 text-center">
                  #{status.order_position}
                </span>

                {canManage && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      title="Editar"
                      disabled={status.is_system_status}
                      onClick={() => openEditModal(status)}
                      className="rounded-md p-1.5 text-secondary hover:bg-surface-elevated hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      title="Desactivar"
                      disabled={status.is_system_status || !status.is_active}
                      onClick={() => handleDeactivate(status)}
                      className="rounded-md p-1.5 text-secondary hover:bg-surface-elevated hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add/Edit modal */}
      {canManage && (
        <StatusFormModal
          isOpen={isModalOpen}
          editingStatus={editingStatus}
          onClose={() => setIsModalOpen(false)}
          onSaved={async () => {
            showSuccess(editingStatus ? "Estado actualizado" : "Estado creado");
            await loadStatuses();
          }}
        />
      )}

      {/* Confirm modal */}
      {confirmConfig && (
        <ConfirmModal isOpen={isConfirmOpen} onClose={closeConfirm} {...confirmConfig} />
      )}

      {/* Toast */}
      <Toast isVisible={isToastVisible} onClose={hideToast} {...toastConfig} />
    </div>
  );
};
