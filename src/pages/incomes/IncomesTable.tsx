import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Income } from "./types";
import { formatIsoDateStringToLocale } from "../../utils/date";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(value);

export const IncomesTable: React.FC<{
  incomes: Income[];
  loading: boolean;
  onSelectIncome: (income: Income) => void;
  onDeleteIncome: (income: Income) => void;
  canManage: boolean;
}> = ({ incomes, loading, onSelectIncome, onDeleteIncome, canManage }) => {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl shadow-sm surface-card">
        <div className="p-12 text-center">
          <p className="text-secondary">Cargando ingresos...</p>
        </div>
      </div>
    );
  }

  if (incomes.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl shadow-sm surface-card">
        <div className="p-12 text-center">
          <h3 className="text-lg font-semibold text-primary mb-2">
            No hay ingresos registrados
          </h3>
          <p className="text-secondary">
            Comienza registrando tu primer pago recibido
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl shadow-sm surface-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-subtle">
          <thead className="table-header">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Pedido
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Monto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary"
              >
                Fecha
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="table-body divide-y divide-subtle">
            {incomes.map((income) => (
              <tr
                key={income.id}
                className={canManage ? "table-row-interactive" : ""}
                onClick={canManage ? () => onSelectIncome(income) : undefined}
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-medium text-primary">
                    #{income.id}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-primary">
                    Pedido #{income.order_id}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(income.amount)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-secondary">
                    {formatIsoDateStringToLocale(income.date)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  {canManage && (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Editar ingreso"
                        aria-label={`Editar ingreso #${income.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncome(income);
                        }}
                        className="rounded-md p-1.5 text-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
                      >
                        <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar ingreso"
                        aria-label={`Eliminar ingreso #${income.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteIncome(income);
                        }}
                        className="rounded-md p-1.5 text-secondary hover:bg-surface-elevated hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
