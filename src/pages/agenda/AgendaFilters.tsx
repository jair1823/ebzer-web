import React from "react";
import type {
  AgendaFilters as AgendaFiltersType,
  AgendaItemPriority,
  AgendaItemStatus,
  AgendaItemType,
  AgendaOrderOption,
} from "./types";
import { formatOrderId } from "../../utils";

interface AgendaFiltersProps {
  filters: AgendaFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<AgendaFiltersType>>;
  orders: AgendaOrderOption[];
}

export const AgendaFilters: React.FC<AgendaFiltersProps> = ({
  filters,
  setFilters,
  orders,
}) => {
  const updateFilter = <TKey extends keyof AgendaFiltersType>(
    key: TKey,
    value: AgendaFiltersType[TKey]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label
          htmlFor="agenda-search"
          className="block text-xs font-medium text-secondary mb-1"
        >
          Buscar
        </label>
        <input
          id="agenda-search"
          type="search"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="input-base text-xs py-1.5"
          placeholder="Titulo, contenido, pedido o cliente"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label
            htmlFor="agenda-status"
            className="block text-xs font-medium text-secondary mb-1"
          >
            Estado
          </label>
          <select
            id="agenda-status"
            value={filters.status}
            onChange={(e) =>
              updateFilter("status", e.target.value as AgendaItemStatus)
            }
            className="input-base text-xs py-1.5"
          >
            <option value="pending">Pendiente</option>
            <option value="done">Completado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="agenda-type"
            className="block text-xs font-medium text-secondary mb-1"
          >
            Tipo
          </label>
          <select
            id="agenda-type"
            value={filters.type}
            onChange={(e) =>
              updateFilter("type", e.target.value as AgendaItemType | "")
            }
            className="input-base text-xs py-1.5"
          >
            <option value="">Todos</option>
            <option value="note">Nota</option>
            <option value="task">Tarea</option>
            <option value="reminder">Recordatorio</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="agenda-priority"
            className="block text-xs font-medium text-secondary mb-1"
          >
            Prioridad
          </label>
          <select
            id="agenda-priority"
            value={filters.priority}
            onChange={(e) =>
              updateFilter("priority", e.target.value as AgendaItemPriority | "")
            }
            className="input-base text-xs py-1.5"
          >
            <option value="">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="agenda-order"
          className="block text-xs font-medium text-secondary mb-1"
        >
          Pedido
        </label>
        <select
          id="agenda-order"
          value={filters.order_id}
          onChange={(e) => updateFilter("order_id", e.target.value)}
          className="input-base text-xs py-1.5"
        >
          <option value="">Todos los pedidos</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {formatOrderId(order.id)} - {order.client_name || order.description}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="agenda-from"
            className="block text-xs font-medium text-secondary mb-1"
          >
            Desde
          </label>
          <input
            id="agenda-from"
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter("from", e.target.value)}
            className="input-base text-xs py-1.5"
          />
        </div>
        <div>
          <label
            htmlFor="agenda-to"
            className="block text-xs font-medium text-secondary mb-1"
          >
            Hasta
          </label>
          <input
            id="agenda-to"
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter("to", e.target.value)}
            className="input-base text-xs py-1.5"
          />
        </div>
      </div>
    </div>
  );
};
