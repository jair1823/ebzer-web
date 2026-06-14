import React from "react";
import type { QuickFilterType } from "./types";
import type { OrderFilters } from "../../services";
import { getLast30DaysRange, getLast7DaysRange } from "../../utils";

interface QuickFiltersProps {
  activeFilter: QuickFilterType;
  onFilterChange: (filterType: QuickFilterType, filters: OrderFilters) => void;
}

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.375rem 0.75rem",
        borderRadius: "9999px",
        border: `1px solid ${isActive ? "rgb(var(--primary))" : "rgb(var(--border))"}`,
        background: isActive ? "rgb(var(--primary))" : "transparent",
        color: isActive ? "rgb(var(--text-on-primary))" : "rgb(var(--text-primary))",
        fontSize: "0.8125rem",
        fontWeight: isActive ? 600 : 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "rgb(var(--primary))";
          e.currentTarget.style.color = "rgb(var(--primary))";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = "rgb(var(--border))";
          e.currentTarget.style.color = "rgb(var(--text-primary))";
        }
      }}
    >
      {label}
    </button>
  );
};

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters: Array<{
    type: QuickFilterType;
    label: string;
    getFilters: () => OrderFilters;
  }> = [
    {
      type: "all",
      label: "📋 Todos",
      getFilters: () => ({}), // No filters = show all
    },
    {
      type: "this-month",
      label: "📅 Este Mes",
      getFilters: () => {
        const range = getLast30DaysRange();
        return {
          dateFrom: range.from,
          dateTo: range.to,
        };
      },
    },
    {
      type: "this-week",
      label: "🗓️ Esta Semana",
      getFilters: () => {
        const range = getLast7DaysRange();
        return {
          dateFrom: range.from,
          dateTo: range.to,
        };
      },
    },
    {
      type: "active",
      label: "🔄 Activos",
      getFilters: () => ({
        status: "new,active,ready", // Backend should handle comma-separated
      }),
    },
    {
      type: "pending-payment",
      label: "💳 Pendiente de Pago",
      getFilters: () => ({
        // This filter will need to be handled in the parent component
        // since it depends on payment status which is not a direct order field
      }),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginBottom: "0.75rem",
      }}
    >
      {filters.map((filter) => (
        <FilterChip
          key={filter.type}
          label={filter.label}
          isActive={activeFilter === filter.type}
          onClick={() => onFilterChange(filter.type, filter.getFilters())}
        />
      ))}
    </div>
  );
};
