import React from "react";
import { ConfirmModal } from "../../components";
import { useConfirmModal } from "../../hooks";
import type { Order, PaymentStatus } from "./types";
import { formatOrderId, getStatusLabel, getStatusBadgeClasses, getPaymentBadgeClasses, getPaymentBadgeText } from "../../utils";

export const OrdersTable: React.FC<{
  orders: Order[];
  loading: boolean;
  onClickRow: (orderId: number) => void;
  finishOrder: (orderId: number) => void;
  paymentStatuses: Map<number, PaymentStatus>;
}> = ({ orders, loading, onClickRow, finishOrder, paymentStatuses }) => {
  const { isOpen, config, openConfirm, closeConfirm } = useConfirmModal();

  const handleFinishClick = (orderId: number) => {
    openConfirm({
      title: "Finalizar pedido",
      message:
        "¿Estás seguro de que deseas finalizar este pedido? Esta acción no se puede deshacer.",
      confirmText: "Finalizar",
      cancelText: "Cancelar",
      variant: "info",
      onConfirm: async () => {
        finishOrder(orderId);
      },
    });
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="mt-2 overflow-hidden rounded-xl shadow-sm surface-card">
        <table className="min-w-full">
          <thead className="bg-primary-soft">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Cliente
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Estado de Pago
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                Monto
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary w-1 whitespace-nowrap">
                Entrega Estimada
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                #
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
                  className="table-row-interactive"
                  onClick={() => onClickRow(order.id)}
                >
                  <td className="px-6 py-3 text-sm text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                      <span className="h-2 w-2 rounded-full bg-current opacity-80"></span>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-primary text-center">
                    {order.client_name
                      ? order.client_name
                      : order.client_phone
                      ? order.client_phone
                      : "-"}
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
                  <td className="px-6 py-3 text-sm text-primary text-center font-medium">
                    {new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: "CRC",
                      minimumFractionDigits: 0,
                    }).format(order.amount_charged)}
                  </td>
                  <td className="px-6 py-3 text-sm text-primary text-center whitespace-nowrap">
                    {order.estimated_delivery_date
                      ? new Date(order.estimated_delivery_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary text-center font-mono">
                    {formatOrderId(order.id)}
                  </td>
                  <td className="text-sm">
                    {order.status !== "completed" && order.status !== "cancelled" && (
                      <button
                        className="btn-base btn-accent rounded-md px-3 py-1 text-xs"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleFinishClick(order.id);
                        }}
                      >
                        Finalizar
                      </button>
                    )}
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
