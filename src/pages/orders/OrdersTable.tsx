import React from "react";
import { ConfirmModal, StatusBadge } from "../../components";
import { useConfirmModal } from "../../hooks";
import type { FinishOrderResponse, Order, PaymentStatus } from "./types";
import {
  formatIsoDateStringToLocale,
  formatOrderId,
  getPaymentBadgeClasses,
  getPaymentBadgeText,
} from "../../utils";
import { canWrite, useAuth } from "../../auth";

const DETAIL_MAX_LENGTH = 30;

const formatDetailText = (detail: string): string => {
  return detail.length > DETAIL_MAX_LENGTH
    ? `${detail.slice(0, DETAIL_MAX_LENGTH)}...`
    : detail;
};

export const OrdersTable: React.FC<{
  orders: Order[];
  loading: boolean;
  onClickRow: (orderId: number) => void;
  onCreateAgendaNote: (order: Order) => void;
  finishOrder: (orderId: number) => Promise<FinishOrderResponse>;
  paymentStatuses: Map<number, PaymentStatus>;
}> = ({
  orders,
  loading,
  onClickRow,
  onCreateAgendaNote,
  finishOrder,
  paymentStatuses,
}) => {
  const { user } = useAuth();
  const writeAllowed = user ? canWrite(user.role) : false;
  const { isOpen, config, openConfirm, closeConfirm } = useConfirmModal();

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
  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="mt-2 overflow-hidden rounded-xl shadow-sm surface-card">
        <table className="min-w-full">
          <thead className="bg-primary-soft">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
                Pedido
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
                Detalle
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Estado de Pago
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary w-1 whitespace-nowrap">
                Entrega Estimada
              </th>
              {/* th to button of finish order */}
              <th></th>
            </tr>
          </thead>

          {loading || !orders.length ? (
            <tbody>
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-secondary"
                >
                  {loading ? (
                    "Cargando pedidos..."
                  ) : orders.length === 0 ? (
                    <div className="space-y-2">
                      <p className="font-medium text-primary">No se encontraron pedidos</p>
                      <p className="text-xs">
                        {/* This message will show when filters are active but no results */}
                        Intenta ajustar los criterios de búsqueda o limpiar los filtros.
                      </p>
                    </div>
                  ) : (
                    "No hay pedidos disponibles."
                  )}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-surface">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={writeAllowed ? "table-row-interactive" : ""}
                  onClick={writeAllowed ? () => onClickRow(order.id) : undefined}
                >
                  <td className="px-6 py-3 text-sm text-left">
                    <span className="font-mono text-sm text-primary">{formatOrderId(order.id)}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-center">
                    {order.status ? (
                      <StatusBadge
                        color={order.status.color}
                        label={order.status.display_name}
                        size="sm"
                      />
                    ) : (
                      <span className="text-xs text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-primary text-center">
                    {order.client_name
                      ? order.client_name
                      : order.client_phone
                      ? order.client_phone
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-primary text-left">
                    <span
                      className="block max-w-[18rem] overflow-hidden text-ellipsis whitespace-nowrap"
                      title={order.description}
                    >
                      {formatDetailText(order.description)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-center">
                    {paymentStatuses.get(order.id) ? (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getPaymentBadgeClasses(paymentStatuses.get(order.id)!)}`}>
                        {getPaymentBadgeText(paymentStatuses.get(order.id)!)}
                      </span>
                    ) : (
                      <span className="text-xs text-tertiary">Cargando...</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-primary text-center whitespace-nowrap">
                    {order.estimated_delivery_date
                    ? formatIsoDateStringToLocale(order.estimated_delivery_date)
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {writeAllowed && (
                      <button
                        className="btn-base btn-outline rounded-md px-3 py-1 text-xs whitespace-nowrap"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          onCreateAgendaNote(order);
                        }}
                      >
                        Nota
                      </button>
                      )}
                      {writeAllowed && order.paid_at === null && (
                        <button
                          className="btn-base btn-accent rounded-md px-3 py-1 text-xs whitespace-nowrap"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleFinishClick(order.id);
                          }}
                        >
                          Finalizar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Confirmation Modal */}
      {config && (
        <ConfirmModal isOpen={isOpen} onClose={closeConfirm} {...config} />
      )}
    </div>
  );
};
