import React from "react";
import { AgendaItemCard } from "./AgendaItemCard";
import type { AgendaGroup, AgendaItem, AgendaItemStatus } from "./types";
import { isoDateStringToLocalDate } from "../../utils";

const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const dateOnlyTime = (value: string | null): number | null => {
  const date = isoDateStringToLocalDate(value);
  return date ? date.getTime() : null;
};

const groupPendingItems = (items: AgendaItem[]): AgendaGroup[] => {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const groups: AgendaGroup[] = [
    { key: "overdue", title: "Vencidas", items: [] },
    { key: "today", title: "Hoy", items: [] },
    { key: "tomorrow", title: "Mañana", items: [] },
    { key: "week", title: "Esta semana", items: [] },
    { key: "none", title: "Sin fecha", items: [] },
  ];

  items.forEach((item) => {
    const dueDate = isoDateStringToLocalDate(item.due_date);
    if (!dueDate) {
      groups[4].items.push(item);
    } else if (dueDate < today) {
      groups[0].items.push(item);
    } else if (dueDate.getTime() === today.getTime()) {
      groups[1].items.push(item);
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      groups[2].items.push(item);
    } else if (dueDate <= weekEnd) {
      groups[3].items.push(item);
    } else {
      groups[4].items.push(item);
    }
  });

  groups.forEach((group) => {
    group.items.sort((a, b) => {
      const aDate = dateOnlyTime(a.due_date) ?? Number.MAX_SAFE_INTEGER;
      const bDate = dateOnlyTime(b.due_date) ?? Number.MAX_SAFE_INTEGER;
      return aDate - bDate || a.id - b.id;
    });
  });

  return groups.filter((group) => group.items.length > 0);
};

interface AgendaGroupedListProps {
  items: AgendaItem[];
  loading: boolean;
  status: AgendaItemStatus;
  onEdit: (item: AgendaItem) => void;
  onComplete: (item: AgendaItem) => void;
  onArchive: (item: AgendaItem) => void;
  onDelete: (item: AgendaItem) => void;
}

export const AgendaGroupedList: React.FC<AgendaGroupedListProps> = ({
  items,
  loading,
  status,
  onEdit,
  onComplete,
  onArchive,
  onDelete,
}) => {
  if (loading || items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="rounded-xl surface-card px-6 py-12 text-center text-sm text-secondary">
          {loading ? (
            "Cargando agenda..."
          ) : (
            <div className="space-y-2">
              <p className="font-medium text-primary">No hay items de agenda</p>
              <p className="text-xs">
                Ajusta los filtros o crea un nuevo item.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const groups =
    status === "pending"
      ? groupPendingItems(items)
      : [
          {
            key: status,
            title: status === "done" ? "Completados" : "Archivados",
            items,
          },
        ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {groups.map((group) => (
          <section key={group.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-primary">
                {group.title}
              </h2>
              <span className="text-xs text-tertiary">{group.items.length}</span>
            </div>
            <div className="space-y-2">
              {group.items.map((item) => (
                <AgendaItemCard
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onComplete={onComplete}
                  onArchive={onArchive}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
