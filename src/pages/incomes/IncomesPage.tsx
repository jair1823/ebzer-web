import React from "react";
import { useIncomes } from "../../hooks";
import { formatCurrency, formatDate, formatOrderId } from "../../utils";

export const IncomesPage: React.FC = () => {
  const { incomes, totalIncome, loading, month, year, setMonth, setYear } = useIncomes();

  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Ingresos
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Gestiona todos tus ingresos y ganancias
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mes
            </label>
            <select
              id="month"
              value={month || ""}
              onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-red-500 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Todos los meses</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Año
            </label>
            <select
              id="year"
              value={year || ""}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-red-500 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Todos los años</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="mb-6 bg-gradient-to-r from-red-400 to-red-500 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-medium text-white/80 uppercase tracking-wide">
            Ingresos Totales
          </h2>
          <p className="mt-2 text-3xl font-bold text-white">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        {/* Incomes Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/40">
          <table className="min-w-full divide-y divide-slate-200/30">
            <thead className="bg-red-200/60">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Factura
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cliente
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fecha
                </th>
              </tr>
            </thead>

            {loading || !incomes.length ? (
              <tbody>
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-slate-500"
                  >
                    {loading ? "Cargando ingresos..." : "No hay ingresos disponibles."}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-100/40 bg-white">
                {incomes.map((income) => (
                  <tr
                    key={income.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3 text-sm text-slate-700 text-center">
                      {formatOrderId(income.id)}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 text-center">
                      {income.client_name || "-"}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 text-center">
                      {formatCurrency(income.amount)}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 text-center">
                      {formatDate(income.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
