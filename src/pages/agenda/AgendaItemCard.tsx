import React from "react";
import type { AgendaItem, AgendaItemPriority, AgendaItemType } from "./types";
import {
  formatIsoDateStringToLocale,
  formatOrderId,
  isoDateStringToLocalDate,
} from "../../utils";
import { canWrite, useAuth } from "../../auth";

const typeLabels: Record<AgendaItemType, string> = {
  note: "Nota",
  task: "Tarea",
  reminder: "Recordatorio",
};

const priorityLabels: Record<AgendaItemPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

const priorityClasses: Record<AgendaItemPriority, string> = {
  low: "bg-info-soft text-info",
  medium: "bg-warning-soft text-warning",
  high: "bg-danger-soft text-danger",
};

const badgeBase =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

const isOverdue = (item: AgendaItem): boolean => {
  const dueDate = isoDateStringToLocalDate(item.due_date);
  if (!dueDate || item.status !== "pending") return false;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return dueDate < todayStart;
};

interface AgendaItemCardProps {
  item: AgendaItem;
  onEdit: (item: AgendaItem) => void;
  onComplete: (item: AgendaItem) => void;
  onArchive: (item: AgendaItem) => void;
  onDelete: (item: AgendaItem) => void;
}

export const AgendaItemCard: React.FC<AgendaItemCardProps> = ({
  item,
  onEdit,
  onComplete,
  onArchive,
  onDelete,
}) => {
  const { user } = useAuth();
  const writeAllowed = user ? canWrite(user.role) : false;
  const showComplete = item.status === "pending";
  const showArchive = item.status !== "archived";

  return (
    <article className="surface-card rounded-lg px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${badgeBase} bg-primary-soft text-brand-primary`}>
              {typeLabels[item.type]}
            </span>
            <span className={`${badgeBase} ${priorityClasses[item.priority]}`}>
              {priorityLabels[item.priority]}
            </span>
            <span className={`${badgeBase} border border-subtle text-secondary`}>
              {item.status === "pending"
                ? "Pendiente"
                : item.status === "done"
                ? "Completado"
                : "Archivado"}
            </span>
            {isOverdue(item) && (
              <span className={`${badgeBase} bg-danger-soft text-danger`}>
                Vencida
              </span>
            )}
            {item.order_id && (
              <span className={`${badgeBase} bg-accent-soft text-brand-secondary`}>
                Pedido {formatOrderId(item.order_id)}
              </span>
            )}
          </div>

          <h3 className="mt-2 text-sm font-semibold text-primary break-words">
            {item.title}
          </h3>

          {item.content && (
            <p className="mt-1 whitespace-pre-line text-sm leading-6 text-secondary break-words">
              {item.content}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-tertiary">
            <span>
              Fecha:{" "}
              {item.due_date
                ? formatIsoDateStringToLocale(item.due_date)
                : "Sin fecha"}
            </span>
            {item.completed_at && (
              <span>
                Completado: {formatIsoDateStringToLocale(item.completed_at)}
              </span>
            )}
            {item.order && (
              <span className="truncate">
                {item.order.client_name || item.order.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
          {writeAllowed && showComplete && (
            <button
              type="button"
              className="btn-base btn-accent rounded-md px-3 py-1 text-xs"
              onClick={() => onComplete(item)}
            >
              Completar
            </button>
          )}
          {writeAllowed && showArchive && (
            <button
              type="button"
              className="btn-base btn-outline rounded-md px-3 py-1 text-xs"
              onClick={() => onArchive(item)}
            >
              Archivar
            </button>
          )}
          {writeAllowed && (
          <button
            type="button"
            className="btn-base btn-outline rounded-md px-3 py-1 text-xs"
            onClick={() => onEdit(item)}
          >
            Editar
          </button>
          )}
          {writeAllowed && (
          <button
            type="button"
            className="btn-base btn-outline rounded-md px-3 py-1 text-xs text-danger"
            onClick={() => onDelete(item)}
          >
            Eliminar
          </button>
          )}
        </div>
      </div>
    </article>
  );
};
