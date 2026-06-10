import React from "react";
import type {
  AgendaCreatePayload,
  AgendaItem,
  AgendaItemFormData,
  AgendaItemPriority,
  AgendaItemType,
  AgendaOrderOption,
} from "./types";
import { formatOrderId, isoDateStringToLocalDate } from "../../utils";

const typeOptions: Array<{ value: AgendaItemType; label: string }> = [
  { value: "note", label: "Nota" },
  { value: "task", label: "Tarea" },
  { value: "reminder", label: "Recordatorio" },
];

const priorityOptions: Array<{ value: AgendaItemPriority; label: string }> = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const initialFormData: AgendaItemFormData = {
  type: "note",
  title: "",
  content: "",
  due_date: "",
  priority: "medium",
  order_id: "",
};

const getInitialCreateFormData = (
  initialCreateValues?: Partial<AgendaItemFormData>
): AgendaItemFormData => ({
  ...initialFormData,
  ...initialCreateValues,
});

const toInputDate = (value: string | null): string => {
  const date = isoDateStringToLocalDate(value);
  return date ? date.toLocaleDateString("en-CA") : "";
};

const toApiDate = (value: string): string | null => {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null;
};

const getFormDataFromItem = (item: AgendaItem | null): AgendaItemFormData => {
  if (!item) return initialFormData;

  return {
    type: item.type,
    title: item.title,
    content: item.content || "",
    due_date: toInputDate(item.due_date),
    priority: item.priority,
    order_id: item.order_id ? String(item.order_id) : "",
  };
};

const toPayload = (formData: AgendaItemFormData): AgendaCreatePayload => ({
  type: formData.type,
  title: formData.title.trim(),
  content: formData.content.trim() || null,
  due_date: toApiDate(formData.due_date),
  priority: formData.priority,
  order_id: formData.order_id ? Number(formData.order_id) : null,
});

interface AgendaItemFormProps {
  isOpen: boolean;
  selectedItem: AgendaItem | null;
  initialCreateValues?: Partial<AgendaItemFormData>;
  orders: AgendaOrderOption[];
  onClose: () => void;
  onSubmit: (data: AgendaCreatePayload) => Promise<void>;
}

export const AgendaItemForm: React.FC<AgendaItemFormProps> = ({
  isOpen,
  selectedItem,
  initialCreateValues,
  orders,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] =
    React.useState<AgendaItemFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setFormData(
        selectedItem
          ? getFormDataFromItem(selectedItem)
          : getInitialCreateFormData(initialCreateValues)
      );
      setValidationError("");
    }
  }, [initialCreateValues, isOpen, selectedItem]);

  if (!isOpen) return null;

  const updateField = <TKey extends keyof AgendaItemFormData>(
    key: TKey,
    value: AgendaItemFormData[TKey]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    if (!formData.title.trim()) {
      setValidationError("El titulo es obligatorio.");
      return false;
    }

    if (formData.type === "reminder" && !formData.due_date) {
      setValidationError("El recordatorio requiere fecha.");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(toPayload(formData));
      setFormData(initialFormData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = selectedItem ? "Editar item" : "Nuevo item";

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm"
      style={{ backgroundColor: "rgb(var(--background) / 0.8)" }}
    >
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-hidden bg-surface shadow-2xl">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <div className="border-b px-6 py-5 bg-surface border-default">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-brand-primary mb-2 text-xs font-semibold uppercase tracking-[0.22em]">
                  Agenda
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-primary">
                  {modalTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border p-2 transition-colors border-default text-secondary hover:bg-surface-elevated"
                aria-label="Cerrar"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-background">
            <div className="space-y-5 px-6 py-6">
              <section className="surface-card rounded-lg px-5 py-5">
                <label className="mb-2 block text-sm font-medium text-primary">
                  Tipo
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("type", option.value)}
                      className={`btn-base rounded-md border px-3 py-2 text-sm ${
                        formData.type === option.value
                          ? "btn-secondary border-transparent"
                          : "btn-outline"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="surface-card rounded-lg px-5 py-5">
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="agenda-title"
                      className="mb-1.5 block text-sm font-medium text-primary"
                    >
                      Titulo <span className="text-danger">*</span>
                    </label>
                    <input
                      id="agenda-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="input-base"
                      required
                      autoFocus={!selectedItem}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="agenda-content"
                      className="mb-1.5 block text-sm font-medium text-primary"
                    >
                      Contenido
                    </label>
                    <textarea
                      id="agenda-content"
                      value={formData.content}
                      onChange={(e) => updateField("content", e.target.value)}
                      className="input-base min-h-36 resize-y"
                    />
                  </div>
                </div>
              </section>

              <section className="surface-card rounded-lg px-5 py-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="agenda-due-date"
                      className="mb-1.5 block text-sm font-medium text-primary"
                    >
                      Fecha
                      {formData.type === "reminder" && (
                        <span className="text-danger"> *</span>
                      )}
                    </label>
                    <input
                      id="agenda-due-date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => updateField("due_date", e.target.value)}
                      className="input-base"
                      required={formData.type === "reminder"}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="agenda-order-link"
                      className="mb-1.5 block text-sm font-medium text-primary"
                    >
                      Pedido
                    </label>
                    <select
                      id="agenda-order-link"
                      value={formData.order_id}
                      onChange={(e) => updateField("order_id", e.target.value)}
                      className="input-base"
                    >
                      <option value="">Sin pedido</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {formatOrderId(order.id)} -{" "}
                          {order.client_name || order.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="surface-card rounded-lg px-5 py-5">
                <label className="mb-2 block text-sm font-medium text-primary">
                  Prioridad
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("priority", option.value)}
                      className={`btn-base rounded-md border px-3 py-2 text-sm ${
                        formData.priority === option.value
                          ? "btn-secondary border-transparent"
                          : "btn-outline"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              {validationError && (
                <p className="text-sm font-medium text-danger">{validationError}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4 border-default bg-surface">
            <button
              type="button"
              onClick={onClose}
              className="btn-base btn-outline rounded-md"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-base btn-secondary rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
