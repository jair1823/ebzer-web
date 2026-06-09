import React from "react";
import { orderStatusesService } from "../services";
import type { OrderStatusOption } from "../pages/orders/types";

interface StatusPickerProps {
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
}

export const StatusPicker: React.FC<StatusPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [statuses, setStatuses] = React.useState<OrderStatusOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    orderStatusesService
      .getActive()
      .then(setStatuses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled || loading}
        className="input-base appearance-none pr-8"
      >
        {loading && <option value="">Cargando...</option>}
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.display_name}
          </option>
        ))}
      </select>
      {/* Color dot overlay showing selected status color */}
      {!loading && value !== null && (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor:
              statuses.find((s) => s.id === value)?.color ?? "#6B7280",
          }}
        />
      )}
    </div>
  );
};
