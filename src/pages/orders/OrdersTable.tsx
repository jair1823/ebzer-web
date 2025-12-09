import React from "react";
import { ConfirmModal } from "../../components";
import { useConfirmModal } from "../../hooks";

export const OrdersTable: React.FC<{
  orders: any[];
  loading: boolean;
  onClickRow: (orderId: number) => void;
  finishOrder: (orderId: number) => void;
}> = ({ orders, loading, onClickRow, finishOrder }) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/40">
        <table className="min-w-full divide-y divide-slate-200/30">
          <thead className="bg-red-200/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                # Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Entrega Estimada
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Monto
              </th>
              {/* th to button of finish order */}
              <th></th>
            </tr>
          </thead>

          {loading ? (
            <tbody>
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-slate-500"
                >
                  Cargando pedidos...
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-slate-100/40 bg-white">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-100 transition-colors"
                  onClick={() => onClickRow(order.id)}
                >
                  <td className="px-6 py-3 text-sm text-slate-700 flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        order.status === "pending"
                          ? "bg-red-400/80"
                          : order.status === "completed"
                          ? "bg-cyan-300/80"
                          : "bg-lime-300/80"
                      }`}
                    ></span>{" "}
                    {/* status */}
                    {order.id}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700">
                    {order.description}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700">
                    {new Date(
                      order.estimated_delivery_date
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-700">
                    ₡{order.amount_charged.toFixed(2)}
                  </td>
                  <td className="text-sm text-slate-700">
                    <button
                      className="px-3 py-1 bg-red-400/80 text-white rounded-md hover:bg-red-500/80 transition-colors"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleFinishClick(order.id);
                      }}
                    >
                      Finalizar
                    </button>
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
