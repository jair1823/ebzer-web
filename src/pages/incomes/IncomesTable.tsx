import React from "react";
import type { Income } from "./types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const IncomesTable: React.FC<{
  incomes: Income[];
  loading: boolean;
  onSelectIncome: (income: Income) => void;
}> = ({ incomes, loading, onSelectIncome }) => {
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
          <thead className="bg-surface">
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
          <tbody className="divide-y divide-subtle bg-surface-elevated">
            {incomes.map((income) => (
              <tr
                key={income.id}
                className="transition-colors hover:bg-surface-hover cursor-pointer"
                onClick={() => onSelectIncome(income)}
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
                    {formatDate(income.date)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncome(income);
                    }}
                    className="text-brand-primary hover:text-brand-primary-hover font-medium"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
