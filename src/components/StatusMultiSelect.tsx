import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { orderStatusesService } from "../services";
import type { OrderStatusOption } from "../pages/orders/types";

interface StatusMultiSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

export const StatusMultiSelect: React.FC<StatusMultiSelectProps> = ({
  value,
  onChange,
}) => {
  const [statuses, setStatuses] = React.useState<OrderStatusOption[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    orderStatusesService.getActive().then(setStatuses).catch(console.error);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggle = (id: number) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  const selectedCount = value.length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="input-base text-xs py-1.5 flex items-center justify-between gap-2 min-w-[140px]"
      >
        <span className="text-secondary">
          {selectedCount === 0
            ? "Todos los estados"
            : `${selectedCount} estado${selectedCount > 1 ? "s" : ""}`}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          aria-hidden="true"
          className={`text-tertiary transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-subtle bg-surface shadow-lg py-1">
          {statuses.map((s) => {
            const isSelected = value.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs hover:bg-surface-elevated transition-colors text-left"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 text-primary">{s.display_name}</span>
                {isSelected && (
                  <Check
                    size={12}
                    strokeWidth={3}
                    aria-hidden="true"
                    className="text-accent flex-shrink-0"
                  />
                )}
              </button>
            );
          })}
          {statuses.length === 0 && (
            <p className="px-3 py-2 text-xs text-secondary">Cargando...</p>
          )}
        </div>
      )}
    </div>
  );
};
