import React from "react";
import { Funnel, Plus, X } from "lucide-react";
import { AgendaFilters } from "./AgendaFilters";
import type {
  AgendaFilters as AgendaFiltersType,
  AgendaOrderOption,
  AgendaSummary,
} from "./types";
import { defaultAgendaFilters } from "../../hooks";
import { canWrite, useAuth } from "../../auth";

interface AgendaHeaderProps {
  summary: AgendaSummary;
  filters: AgendaFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<AgendaFiltersType>>;
  orders: AgendaOrderOption[];
  openCreateItem: () => void;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  summary,
  filters,
  setFilters,
  orders,
  openCreateItem,
}) => {
  const { user } = useAuth();
  const writeAllowed = user ? canWrite(user.role) : false;
  const [showFilters, setShowFilters] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    filters.status !== defaultAgendaFilters.status ||
    filters.type !== defaultAgendaFilters.type ||
    filters.priority !== defaultAgendaFilters.priority ||
    filters.order_id !== defaultAgendaFilters.order_id ||
    filters.from !== defaultAgendaFilters.from ||
    filters.to !== defaultAgendaFilters.to ||
    filters.search.trim() !== defaultAgendaFilters.search;

  const activeFiltersCount = [
    filters.status !== defaultAgendaFilters.status,
    Boolean(filters.type),
    Boolean(filters.priority),
    Boolean(filters.order_id),
    Boolean(filters.from),
    Boolean(filters.to),
    Boolean(filters.search.trim()),
  ].filter(Boolean).length;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFilters]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-primary whitespace-nowrap">
          Agenda
        </h1>

        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary"
          aria-label="Resumen de agenda"
        >
          <span>Hoy pendientes: {summary.pendingToday}</span>
          <span aria-hidden="true">|</span>
          <span>Vencidas: {summary.overdue}</span>
          <span aria-hidden="true">|</span>
          <span>Ligadas a pedidos: {summary.linkedToOrders}</span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              className="btn-base btn-outline relative h-8 w-8 rounded-md p-0"
              onClick={() => setShowFilters((value) => !value)}
              aria-label="Mostrar filtros de agenda"
              title="Mostrar filtros de agenda"
            >
              <Funnel size={16} strokeWidth={2} aria-hidden="true" />
              {hasActiveFilters && (
                <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] leading-none text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-[min(92vw,32rem)] bg-surface border border-subtle rounded-lg shadow-lg z-50">
                <AgendaFilters
                  filters={filters}
                  setFilters={setFilters}
                  orders={orders}
                />
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-base btn-outline rounded-md text-xs px-3 py-1.5"
              onClick={() => setFilters(defaultAgendaFilters)}
              aria-label="Limpiar filtros de agenda"
            >
              <X size={12} strokeWidth={2} aria-hidden="true" className="mr-1" />
              Limpiar
            </button>
          )}

          {writeAllowed && (
          <button
            type="button"
            className="btn-base btn-secondary rounded-md text-xs px-3 py-1.5"
            onClick={openCreateItem}
            aria-label="Crear item de agenda"
          >
            <Plus size={12} strokeWidth={2.5} aria-hidden="true" className="mr-1" />
            Nuevo
          </button>
          )}
        </div>
      </div>
    </div>
  );
};
