import React from "react";
import {
  AlertTriangle,
  Banknote,
  ChartColumn,
  CircleDollarSign,
  PackageCheck,
  PackageOpen,
  WalletCards,
} from "lucide-react";
import { insightsService } from "../../services";
import { formatCurrency, formatDateInputValue } from "../../utils";
import type { InsightsSummary } from "./types";

const formatDateParam = (date: Date): string => formatDateInputValue(date);

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const label = new Intl.DateTimeFormat("es-CR", {
    month: "long",
    year: "numeric",
  }).format(now);

  return {
    from: formatDateParam(start),
    to: formatDateParam(end),
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
};

const platformLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
};

const emptySummary: InsightsSummary = {
  income_total: 0,
  expense_total: 0,
  profit: 0,
  pending_collection: 0,
  active_orders: 0,
  paid_completed_orders: 0,
  overdue_orders: 0,
  sales_by_platform: [],
  top_expense_merchants: [],
};

export const InsightsPage: React.FC = () => {
  const monthRange = React.useMemo(getCurrentMonthRange, []);
  const [summary, setSummary] = React.useState<InsightsSummary>(emptySummary);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const loadSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await insightsService.getSummary({
          from: monthRange.from,
          to: monthRange.to,
        });
        if (!cancelled) setSummary(response);
      } catch (err) {
        console.error("Error loading insights:", err);
        if (!cancelled) setError("No se pudo cargar el resumen");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [monthRange]);

  const metricCards = [
    { label: "Ingresos", value: formatCurrency(summary.income_total), Icon: CircleDollarSign, tone: "text-success" },
    { label: "Gastos", value: formatCurrency(summary.expense_total), Icon: WalletCards, tone: "text-warning" },
    { label: "Utilidad", value: formatCurrency(summary.profit), Icon: Banknote, tone: summary.profit >= 0 ? "text-success" : "text-danger" },
    { label: "Por cobrar", value: formatCurrency(summary.pending_collection), Icon: PackageOpen, tone: "text-info" },
    { label: "Activos", value: String(summary.active_orders), Icon: ChartColumn, tone: "text-brand-primary" },
    { label: "Completados", value: String(summary.paid_completed_orders), Icon: PackageCheck, tone: "text-success" },
    { label: "Vencidos", value: String(summary.overdue_orders), Icon: AlertTriangle, tone: summary.overdue_orders > 0 ? "text-danger" : "text-secondary" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-primary">Insights</h1>
          <p className="mt-1 text-sm text-secondary">{monthRange.label}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-muted bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {metricCards.map(({ label, value, Icon, tone }) => (
          <div key={label} className="rounded-lg border border-default bg-surface p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-secondary">{label}</span>
              <Icon size={17} className={tone} aria-hidden="true" />
            </div>
            <p className="text-lg font-semibold text-primary">{loading ? "..." : value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-default bg-surface shadow-sm">
          <div className="border-b border-default px-4 py-3">
            <h2 className="text-sm font-semibold text-primary">Ventas por plataforma</h2>
          </div>
          <div className="divide-y divide-[rgb(var(--border-subtle))]">
            {summary.sales_by_platform.length === 0 ? (
              <p className="px-4 py-6 text-sm text-secondary">Sin ventas registradas</p>
            ) : (
              summary.sales_by_platform.map((item) => (
                <div key={item.platform} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {platformLabels[item.platform] ?? item.platform}
                    </p>
                    <p className="text-xs text-secondary">{item.count} pedido(s)</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{formatCurrency(item.total)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-default bg-surface shadow-sm">
          <div className="border-b border-default px-4 py-3">
            <h2 className="text-sm font-semibold text-primary">Top comercios por gasto</h2>
          </div>
          <div className="divide-y divide-[rgb(var(--border-subtle))]">
            {summary.top_expense_merchants.length === 0 ? (
              <p className="px-4 py-6 text-sm text-secondary">Sin gastos registrados</p>
            ) : (
              summary.top_expense_merchants.map((item) => (
                <div key={item.comercio_id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <p className="text-sm font-medium text-primary">{item.name}</p>
                  <p className="text-sm font-semibold text-primary">{formatCurrency(item.total)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
