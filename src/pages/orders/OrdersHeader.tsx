import React from "react";
import { CreateOrderForm } from "./CreateOrderForm";
import type { Order, OrderFormData, OrderFilters, OrderStatus, QuickFilterType } from "./types";

const statusOptions: { value: OrderStatus; label: string; colorClass: string; textClass: string }[] = [
  { value: "new", label: "Nuevo", colorClass: "bg-info", textClass: "text-white" },
  { value: "active", label: "En progreso", colorClass: "bg-warning", textClass: "text-white" },
  { value: "ready", label: "Listo", colorClass: "bg-success", textClass: "text-white" },
  { value: "completed", label: "Entregado", colorClass: "bg-muted", textClass: "text-white" },
  { value: "cancelled", label: "Cancelado", colorClass: "bg-danger", textClass: "text-white" },
];

export const OrdersHeader: React.FC<{
  filters: OrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<OrderFilters>>;
  isOpen: boolean;
  selectedOrder?: Order | null;
  createOrder: (data: OrderFormData) => Promise<void>;
  updateOrder: (orderId: number, data: OrderFormData) => Promise<void>;
  toggleModal: () => void;
  openCreateOrder: () => void;
  finishOrder: (orderId: number) => void;
  onToggleHistory: () => void;
  isShowingFullHistory: boolean;
  activeQuickFilter: QuickFilterType;
}> = ({ 
  filters, 
  setFilters, 
  createOrder, 
  updateOrder, 
  isOpen, 
  toggleModal, 
  selectedOrder, 
  openCreateOrder, 
  finishOrder,
  onToggleHistory,
  isShowingFullHistory,
  activeQuickFilter,
}) => {
  
  const [showFilters, setShowFilters] = React.useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

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

  const handleStatusToggle = (status: OrderStatus) => {
    setFilters((prev) => {
      const isSelected = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: isSelected
          ? prev.statuses.filter((s) => s !== status)
          : [...prev.statuses, status],
      };
    });
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      statuses: [],
      hideCancelled: true, // Always keep this active
    });
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.statuses.length > 0) count += filters.statuses.length;
    return count;
  };

  const hasActiveFilters = (): boolean => {
    return filters.dateFrom !== null || 
           filters.dateTo !== null || 
           filters.statuses.length > 0;
  };

  const handleToggleHideCancelled = () => {
    setFilters((prev) => ({
      ...prev,
      hideCancelled: !prev.hideCancelled,
    }));
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
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      {/* Inline Header - Una sola línea */}
      <div className="flex items-center justify-between gap-4">
        
        {/* Título compacto */}
        <h1 className="text-xl font-semibold text-primary whitespace-nowrap">
          Pedidos
        </h1>

        {/* Botones de acción inline */}
        <div className="flex items-center gap-2">
          
          {/* Toggle de Historial */}
          <button
            type="button"
            className={`btn-base rounded-md text-xs px-3 py-1.5 ${
              isShowingFullHistory ? "btn-primary" : "btn-outline"
            }`}
            onClick={onToggleHistory}
            aria-label={isShowingFullHistory ? "Ver recientes" : "Ver historial completo"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isShowingFullHistory ? "Ver Recientes" : "Historial"}
          </button>

          {/* Indicador visual de filtro activo */}
          {activeQuickFilter !== "all" && activeQuickFilter !== "this-month" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-info-soft rounded-full text-xs font-medium text-info-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-info animate-pulse" />
              Filtro activo
            </div>
          )}

          {/* Botón Filtros con dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              className="btn-base btn-outline rounded-md text-xs px-3 py-1.5"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Mostrar filtros"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M8 12h8M11 18h2" strokeLinecap="round" />
              </svg>
              Filtros
              {hasActiveFilters() && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-accent text-white">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Dropdown de filtros */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-96 bg-surface border border-subtle rounded-lg shadow-lg z-50">
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

                  {/* Estados compactos */}
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">
                      Estados
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {statusOptions.map((option) => {
                        const isSelected = filters.statuses.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleStatusToggle(option.value)}
                            className={`
                              flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium
                              transition-all duration-150
                              ${
                                isSelected
                                  ? `${option.colorClass} ${option.textClass} shadow-sm`
                                  : "bg-surface-elevated text-secondary border border-subtle hover:bg-surface-hover"
                              }
                            `}
                          >
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ocultar cancelados */}
                  <div className="pt-3 border-t border-subtle">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.hideCancelled}
                        onChange={handleToggleHideCancelled}
                        className="w-4 h-4 rounded border-subtle text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-xs font-medium text-secondary">
                        Ocultar pedidos cancelados
                      </span>
                    </label>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Botón Limpiar - compacto */}
          {hasActiveFilters() && (
            <button
              type="button"
              className="btn-base btn-outline rounded-md text-xs px-3 py-1.5"
              onClick={handleClearFilters}
              aria-label="Limpiar filtros"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}

          {/* Botón Nuevo - compacto */}
          <button
            type="button"
            className="btn-base btn-secondary rounded-md text-xs px-3 py-1.5"
            onClick={openCreateOrder}
            aria-label="Crear nuevo pedido"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <g className="stroke-slate-600" strokeLinecap="round" strokeWidth="3">
                <path d="M12 19V5" />
                <path d="M19 12H5" />
              </g>
            </svg>
            Nuevo
          </button>
        </div>

      </div>

      {/* Modal */}
      <CreateOrderForm
        isOpen={isOpen}
        selectedOrder={selectedOrder || undefined}
        createOrder={createOrder}
        toggleModal={toggleModal}
        openCreateOrder={openCreateOrder}
        updateOrder={updateOrder}
        finishOrder={finishOrder}
        showTrigger={false}
      />
    </div>
  );
};
