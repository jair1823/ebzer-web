import React from "react";
import { X } from "lucide-react";
import type { OrderStatusOption } from "../orders/types";
import type { CreateOrderStatusData, UpdateOrderStatusData } from "../../services";
import { orderStatusesService } from "../../services";
import { hexToRgba } from "../../utils";

interface StatusFormModalProps {
  isOpen: boolean;
  editingStatus: OrderStatusOption | null;
  onClose: () => void;
  onSaved: () => void;
}

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const DEFAULT_COLOR = "#90D0C0";

const RECOMMENDED_STATUS_COLORS = [
  { label: "Pendiente", color: "#FFD040" },
  { label: "En proceso", color: "#90D0C0" },
  { label: "Atencion", color: "#FF9090" },
  { label: "Completado", color: "#7BCFAF" },
  { label: "Inactivo", color: "#8B8B8B" },
];

export const StatusFormModal: React.FC<StatusFormModalProps> = ({
  isOpen,
  editingStatus,
  onClose,
  onSaved,
}) => {
  const isEdit = editingStatus !== null;

  const [displayName, setDisplayName] = React.useState("");
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState(DEFAULT_COLOR);
  const [orderPosition, setOrderPosition] = React.useState(1);
  const [isFinalStatus, setIsFinalStatus] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const previewTextColor = `color-mix(in srgb, ${color} 55%, rgb(var(--text-primary)))`;

  // Populate form when editing
  React.useEffect(() => {
    if (editingStatus) {
      setDisplayName(editingStatus.display_name);
      setName(editingStatus.name);
      setColor(editingStatus.color ?? DEFAULT_COLOR);
      setOrderPosition(editingStatus.order_position);
      setIsFinalStatus(editingStatus.is_final_status);
    } else {
      setDisplayName("");
      setName("");
      setColor(DEFAULT_COLOR);
      setOrderPosition(1);
      setIsFinalStatus(false);
    }
    setError(null);
  }, [editingStatus, isOpen]);

  // Auto-generate slug from display_name when creating
  const handleDisplayNameChange = (val: string) => {
    setDisplayName(val);
    if (!isEdit) setName(slugify(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!name.trim()) {
      setError("El identificador es obligatorio.");
      return;
    }
    if (orderPosition < 1) {
      setError("La posición debe ser mayor a 0.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && editingStatus) {
        const data: UpdateOrderStatusData = {
          display_name: displayName,
          color,
          order_position: orderPosition,
          is_final_status: isFinalStatus,
        };
        await orderStatusesService.update(editingStatus.id, data);
      } else {
        const data: CreateOrderStatusData = {
          name,
          display_name: displayName,
          color,
          order_position: orderPosition,
          is_final_status: isFinalStatus,
        };
        await orderStatusesService.create(data);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? "Error al guardar el estado.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: "rgb(var(--background) / 0.7)" }}>
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-2xl border border-subtle overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
            <h2 className="text-base font-semibold text-primary">
              {isEdit ? "Editar estado" : "Nuevo estado"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border p-1.5 border-subtle text-secondary hover:bg-surface-elevated transition-colors"
              aria-label="Cerrar"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {error && (
              <p className="rounded-lg bg-danger-subtle px-3 py-2 text-xs font-medium text-danger">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                className="input-base"
                placeholder="Ej. En revisión"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-primary">
                Identificador <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => !isEdit && setName(slugify(e.target.value))}
                readOnly={isEdit}
                className={`input-base font-mono text-sm ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="en_revision"
                required
              />
              <p className="mt-1 text-xs text-secondary">
                {isEdit
                  ? "El identificador no puede cambiarse después de la creación."
                  : "Generado automáticamente. Solo letras minúsculas y guiones bajos."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded border border-subtle bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="input-base font-mono text-xs"
                    placeholder={DEFAULT_COLOR}
                    maxLength={7}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {RECOMMENDED_STATUS_COLORS.map((option) => (
                    <button
                      key={option.color}
                      type="button"
                      onClick={() => setColor(option.color)}
                      className={`h-7 w-7 rounded-full border transition-transform hover:scale-105 focus-ring ${
                        color.toUpperCase() === option.color ? "border-strong" : "border-subtle"
                      }`}
                      style={{ backgroundColor: option.color }}
                      aria-label={`Usar color ${option.label}`}
                      title={option.label}
                    />
                  ))}
                </div>
                {/* Preview */}
                <span
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: hexToRgba(color, 0.18), color: previewTextColor }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {displayName || "Vista previa"}
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary">
                  Posición <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  value={orderPosition}
                  onChange={(e) => setOrderPosition(Number(e.target.value))}
                  min={1}
                  className="input-base"
                  required
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFinalStatus}
                onChange={(e) => setIsFinalStatus(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent"
              />
              <span className="text-sm text-primary">
                Marcar pedidos como completados al aplicar este estado
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-subtle bg-surface-elevated">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-base btn-ternary justify-center rounded-xl px-5 py-2"
            >
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear estado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
