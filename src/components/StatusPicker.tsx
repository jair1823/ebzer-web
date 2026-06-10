import React from "react";
import { orderStatusesService } from "../services";
import type { OrderStatusOption } from "../pages/orders/types";

interface StatusPickerProps {
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
  statusFilter?: (status: OrderStatusOption) => boolean;
  autoSelectFirstOption?: boolean;
}

export const StatusPicker: React.FC<StatusPickerProps> = ({
  value,
  onChange,
  disabled = false,
  statusFilter,
  autoSelectFirstOption = false,
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

  const visibleStatuses = React.useMemo(
    () => statuses.filter(statusFilter ?? (() => true)),
    [statuses, statusFilter]
  );

  React.useEffect(() => {
    if (!autoSelectFirstOption || loading || value !== null || visibleStatuses.length === 0) {
      return;
    }

    onChange(visibleStatuses[0].id);
  }, [autoSelectFirstOption, loading, onChange, value, visibleStatuses]);

  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled || loading}
        className="input-base appearance-none pr-8"
      >
        {loading && <option value="">Cargando...</option>}
        {!loading && visibleStatuses.length === 0 && (
          <option value="">Sin estados disponibles</option>
        )}
        {visibleStatuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.display_name}
          </option>
        ))}
      </select>
    </div>
  );
};
