import React from "react";
import type { TemporaryIncome } from "./types";
import { formatCurrency } from "../../utils";

interface OrderPaymentsSectionProps {
  incomes: TemporaryIncome[];
  newIncomeAmount: number;
  newIncomeDate: string;
  onIncomeAmountChange: (amount: number) => void;
  onIncomeDateChange: (date: string) => void;
  onAddIncome: () => void;
  onRemoveIncome: (id: string) => void;
}

export const OrderPaymentsSection: React.FC<OrderPaymentsSectionProps> = ({
  incomes,
  newIncomeAmount,
  newIncomeDate,
  onIncomeAmountChange,
  onIncomeDateChange,
  onAddIncome,
  onRemoveIncome,
}) => {
  return (
    <section className="rounded-3xl surface-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-primary text-xs font-semibold uppercase tracking-[0.18em]">
          Pagos recibidos
        </p>
        {incomes.length > 0 && (
          <span className="text-xs text-secondary">
            {incomes.length} pago{incomes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Existing incomes rows */}
        {incomes.map((income) => (
          <div 
            key={income.id}
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 bg-surface border-default"
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(income.amount)}
              </p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs text-secondary">
                {income.date ? new Date(income.date).toLocaleDateString('es-CR') : 'Sin fecha'}
              </p>
            </div>
            <div className="flex-shrink-0" data-invoice-exclude="true">
              {!income.isExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveIncome(income.id)}
                  className="text-danger hover:text-danger-hover p-1"
                  aria-label="Eliminar pago"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Input row - always at the end */}
        <div
          className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 bg-surface-elevated border-subtle"
          data-invoice-exclude="true"
        >
          <div className="flex-1">
            <input
              type="number"
              min="0"
              step="0.01"
              value={newIncomeAmount || ""}
              onChange={(e) => onIncomeAmountChange(Number(e.target.value))}
              placeholder="Monto"
              className="input-base text-sm"
            />
            {newIncomeAmount > 0 && (
              <p className="mt-1 text-xs text-secondary">
                {formatCurrency(newIncomeAmount)}
              </p>
            )}
          </div>
          <div className="flex-1">
            <input
              type="date"
              value={newIncomeDate}
              onChange={(e) => onIncomeDateChange(e.target.value)}
              className="input-base text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={onAddIncome}
              disabled={newIncomeAmount <= 0}
              className="rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white p-2 hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              aria-label="Agregar pago"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {incomes.length === 0 && (
          <p className="text-xs text-center text-tertiary mt-2">
            Agrega los pagos recibidos de este pedido
          </p>
        )}
      </div>
    </section>
  );
};
