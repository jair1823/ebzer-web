import React from "react";
import { Funnel, Plus, SquareStack, Table, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { OrderFilters, OrdersSummary, OrdersViewMode } from "./types";
import { StatusMultiSelect } from "../../components";
import { formatCurrency } from "../../utils";
import styles from "./OrdersHeader.module.css";
import { canWrite, useAuth } from "../../auth";

export const OrdersHeader: React.FC<{
  summary: OrdersSummary;
  filters: OrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<OrderFilters>>;
  viewMode: OrdersViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<OrdersViewMode>>;
}> = ({
  summary,
  filters,
  setFilters,
  viewMode,
  setViewMode,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const writeAllowed = user ? canWrite(user.role) : false;
  const [showFilters, setShowFilters] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);
  const summaryItems = [
    `Ingresos mes(${summary.monthLabel}): ${formatCurrency(summary.monthlyIncome)}`,
    `Pendiente por cobrar: ${formatCurrency(summary.pendingCollection)}`,
    `Pedidos Pendientes: ${summary.activeOrders}`,
  ];

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      dateFrom: e.target.value || null,
    }));
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      dateTo: e.target.value || null,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      status_ids: [],
    });
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.status_ids.length > 0) count += filters.status_ids.length;
    return count;
  };

  const hasActiveFilters = (): boolean => {
    return filters.dateFrom !== null || 
           filters.dateTo !== null || 
           filters.status_ids.length > 0;
  };

  // Close filters dropdown when clicking outside
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
    <div className={`mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 ${styles.header}`}>
      <div className="space-y-4">
        <h1 className={`text-xl font-semibold text-primary whitespace-nowrap ${styles.title}`}>
          Pedidos
        </h1>

        <div className={styles.summaryLine} aria-label="Resumen de pedidos">
          {summaryItems.map((item, index) => (
            <React.Fragment key={item}>
              {index > 0 && (
                <span className={styles.summarySeparator} aria-hidden="true">
                  |
                </span>
              )}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Botones de acción inline */}
        <div className={`flex items-center justify-end gap-2 ${styles.actionGroup}`}>
          <div className={styles.viewSwitch} aria-label="Vista de pedidos">
            <button
              type="button"
              className={`btn-base h-8 w-8 rounded-md p-0 ${
                viewMode === "table" ? "btn-secondary" : "btn-outline"
              }`}
              onClick={() => setViewMode("table")}
              aria-label="Vista de tabla"
              aria-pressed={viewMode === "table"}
              title="Vista de tabla"
            >
              <Table size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`btn-base h-8 w-8 rounded-md p-0 ${
                viewMode === "cards" ? "btn-secondary" : "btn-outline"
              }`}
              onClick={() => setViewMode("cards")}
              aria-label="Vista de tarjetas"
              aria-pressed={viewMode === "cards"}
              title="Vista de tarjetas"
            >
              <SquareStack size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          
          {/* Botón Filtros con dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              className={`btn-base btn-outline h-8 w-8 rounded-md p-0 ${styles.filterButton}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Mostrar filtros"
              title="Mostrar filtros"
            >
              <Funnel size={16} strokeWidth={2} aria-hidden="true" />
              {hasActiveFilters() && (
                <span className={`${styles.badge} ${styles.filterBadge} bg-accent text-white`} aria-hidden="false">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Dropdown de filtros */}
            {showFilters && (
              <div className={`absolute right-0 mt-2 w-96 bg-surface border border-subtle rounded-lg shadow-lg z-50 ${styles.dropdown}`}>
                <div className="p-4 space-y-4">
                  
                  {/* Fechas en una fila */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="filter-date-from" className="block text-xs font-medium text-secondary mb-1">
                        Desde
                      </label>
                      <input
                        id="filter-date-from"
                        type="date"
                        value={filters.dateFrom || ""}
                        onChange={handleDateFromChange}
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label htmlFor="filter-date-to" className="block text-xs font-medium text-secondary mb-1">
                        Hasta
                      </label>
                      <input
                        id="filter-date-to"
                        type="date"
                        value={filters.dateTo || ""}
                        onChange={handleDateToChange}
                        className="input-base text-xs py-1.5"
                      />
                    </div>
                  </div>

                  {/* Status multi-select */}
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">
                      Estados
                    </label>
                    <StatusMultiSelect
                      value={filters.status_ids}
                      onChange={(ids) =>
                        setFilters((prev) => ({ ...prev, status_ids: ids }))
                      }
                    />
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Botón Limpiar - compacto */}
          {hasActiveFilters() && (
            <button
              type="button"
              className={`btn-base btn-outline rounded-md text-xs px-3 py-1.5 ${styles.clearButton}`}
              onClick={handleClearFilters}
              aria-label="Limpiar filtros"
            >
              <X size={12} strokeWidth={2} aria-hidden="true" className="mr-1" />
              Limpiar
            </button>
          )}

          {/* Botón Nuevo - compacto */}
          {writeAllowed && (
          <button
            type="button"
            className={`btn-base btn-secondary rounded-md text-xs px-3 py-1.5 ${styles.primaryButton}`}
            onClick={() => navigate("/orders/new")}
            aria-label="Crear nuevo pedido"
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
