import React from "react";
import { CreateOrderForm } from "./CreateOrderForm";
import type { Order, OrderFormData, OrderFilters, OrderStatus } from "./types";
import styles from "./OrdersHeader.module.css";

const statusOptions: { value: OrderStatus; label: string; colorClass: string; textClass: string }[] = [
  { value: "confirmed", label: "Confirmado", colorClass: "bg-info", textClass: "text-white" },
  { value: "in_progress", label: "En progreso", colorClass: "bg-warning", textClass: "text-white" },
  { value: "ready", label: "Listo", colorClass: "bg-success", textClass: "text-white" },
  { value: "shipped", label: "Enviado", colorClass: "bg-accent", textClass: "text-white" },
  { value: "delivered", label: "Entregado", colorClass: "bg-secondary", textClass: "text-primary" },
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
}> = ({ filters, setFilters, createOrder, updateOrder, isOpen, toggleModal, selectedOrder, openCreateOrder, finishOrder }) => {
  
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
      {/* Inline Header - Una sola línea */}
      <div className="flex items-center justify-between gap-4">
        
        {/* Título compacto */}
        <h1 className={`text-xl font-semibold text-primary whitespace-nowrap ${styles.title}`}>
          Pedidos
        </h1>

        {/* Botones de acción inline */}
        <div className={`flex items-center gap-2 ${styles.actionGroup}`}>
          
          {/* Botón Filtros con dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              className={`btn-base btn-outline rounded-md text-xs px-3 py-1.5 ${styles.filterButton}`}
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
                <span className={`ml-1.5 ${styles.badge} bg-accent text-white`} aria-hidden="false">
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
            className={`btn-base btn-secondary rounded-md text-xs px-3 py-1.5 ${styles.primaryButton}`}
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
