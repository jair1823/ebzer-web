import React from "react";
import { ConfirmModal, StatusBadge } from "../../components";
import { useConfirmModal } from "../../hooks";
import { canWrite, useAuth } from "../../auth";
import type { FinishOrderResponse, Order } from "./types";
import {
  formatCurrency,
  formatIsoDateStringToLocale,
  formatOrderId,
} from "../../utils";

interface OrdersCardsProps {
  orders: Order[];
  loading: boolean;
  groupByStatus: boolean;
  onClickRow: (orderId: number) => void;
  onCreateAgendaNote: (order: Order) => void;
  finishOrder: (orderId: number) => Promise<FinishOrderResponse>;
}

interface OrderCardGroup {
  key: string;
  label: string;
  orderPosition: number;
  isFinished: boolean;
  orders: Order[];
}

const FINISHED_GROUP_POSITION = Number.MAX_SAFE_INTEGER;
const MISSING_STATUS_GROUP_POSITION = Number.MAX_SAFE_INTEGER - 1;

const getClientLabel = (order: Order): string => {
  return order.client_name?.trim() || order.client_phone?.trim() || "-";
};

const getDeliveryLabel = (order: Order): string => {
  return order.estimated_delivery_date
    ? formatIsoDateStringToLocale(order.estimated_delivery_date)
    : "-";
};

const groupOrdersByStatus = (orders: Order[]): OrderCardGroup[] => {
  const groups = new Map<string, OrderCardGroup>();

  orders.forEach((order) => {
    const isFinished = order.paid_at !== null;
    const key = isFinished ? "finished" : `status-${order.status?.id ?? "missing"}`;
    const label = isFinished
      ? "Finalizado"
      : order.status?.display_name ?? "Sin estado";
    const orderPosition = isFinished
      ? FINISHED_GROUP_POSITION
      : order.status?.order_position ?? MISSING_STATUS_GROUP_POSITION;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label,
        orderPosition,
        isFinished,
        orders: [],
      });
    }

    groups.get(key)!.orders.push(order);
  });

  return [...groups.values()].sort((a, b) => {
    if (a.orderPosition !== b.orderPosition) {
      return a.orderPosition - b.orderPosition;
    }

    if (a.isFinished !== b.isFinished) {
      return a.isFinished ? 1 : -1;
    }

    return a.label.localeCompare(b.label, "es");
  });
};

export const OrdersCards: React.FC<OrdersCardsProps> = ({
  orders,
  loading,
  groupByStatus,
  onClickRow,
  onCreateAgendaNote,
  finishOrder,
}) => {
  const { user } = useAuth();
  const writeAllowed = user ? canWrite(user.role) : false;
  const { isOpen, config, openConfirm, closeConfirm } = useConfirmModal();
  const [expandedOrderIds, setExpandedOrderIds] = React.useState<Set<number>>(
    () => new Set()
  );

  const groups = React.useMemo<OrderCardGroup[]>(() => {
    if (groupByStatus) return groupOrdersByStatus(orders);

    return [
      {
        key: "all",
        label: "",
        orderPosition: 0,
        isFinished: false,
        orders,
      },
    ];
  }, [groupByStatus, orders]);

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleFinishClick = (orderId: number) => {
    openConfirm({
      title: "Finalizar y registrar pago",
      message:
        "Esto puede crear un ingreso por el saldo pendiente, cambiar el pedido a completado y marcarlo como pagado.",
      confirmText: "Finalizar",
      cancelText: "Cancelar",
      variant: "info",
      onConfirm: async () => {
        await finishOrder(orderId);
      },
    });
  };

  if (loading || !orders.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="mt-2 rounded-xl px-6 py-12 text-center text-sm text-secondary shadow-sm surface-card">
          {loading ? (
            "Cargando pedidos..."
          ) : (
            <div className="space-y-2">
              <p className="font-medium text-primary">No se encontraron pedidos</p>
              <p className="text-xs">
                Intenta ajustar los criterios de búsqueda o limpiar los filtros.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.key} className="space-y-3">
            {groupByStatus && (
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-primary">{group.label}</h2>
                <span className="text-xs text-tertiary">{group.orders.length}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.orders.map((order) => {
                const isExpanded = expandedOrderIds.has(order.id);

                return (
                  <article
                    key={order.id}
                    className="surface-card rounded-lg border-t-4 border-subtle px-4 py-3 shadow-sm"
                    style={
                      order.status ? { borderTopColor: order.status.color } : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {formatOrderId(order.id)}
                          </span>
                          {order.status ? (
                            <StatusBadge
                              color={order.status.color}
                              label={order.status.display_name}
                              size="sm"
                            />
                          ) : (
                            <span className="text-xs text-tertiary">Sin estado</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="break-words text-sm font-medium text-primary">
                            {getClientLabel(order)}
                          </p>
                          <p className="break-words text-sm text-secondary">
                            {order.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-subtle pt-3">
                      <div>
                        <p className="text-xs font-medium uppercase text-tertiary">
                          Entrega estimada
                        </p>
                        <p className="text-sm text-primary">{getDeliveryLabel(order)}</p>
                      </div>
                      <button
                        type="button"
                        className="btn-base btn-outline rounded-md px-3 py-1.5 text-xs"
                        onClick={() => toggleExpanded(order.id)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 border-t border-subtle pt-3">
                        <div>
                          <p className="text-xs font-medium uppercase text-tertiary">
                            Monto
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(order.amount_charged)}
                          </p>
                        </div>

                        {order.notes?.trim() && (
                          <div>
                            <p className="text-xs font-medium uppercase text-tertiary">
                              Notas
                            </p>
                            <p className="break-words text-sm text-secondary">
                              {order.notes}
                            </p>
                          </div>
                        )}

                        {writeAllowed && (
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              className="btn-base btn-outline rounded-md px-3 py-1 text-xs"
                              onClick={() => onClickRow(order.id)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn-base btn-outline rounded-md px-3 py-1 text-xs"
                              onClick={() => onCreateAgendaNote(order)}
                            >
                              Nota
                            </button>
                            {order.paid_at === null && (
                              <button
                                type="button"
                                className="btn-base btn-accent rounded-md px-3 py-1 text-xs"
                                onClick={() => handleFinishClick(order.id)}
                              >
                                Finalizar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {config && (
        <ConfirmModal isOpen={isOpen} onClose={closeConfirm} {...config} />
      )}
    </div>
  );
};
