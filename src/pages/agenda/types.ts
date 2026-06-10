import type { Order } from "../orders/types";

export type AgendaItemType = "note" | "task" | "reminder";
export type AgendaItemStatus = "pending" | "done" | "archived";
export type AgendaItemPriority = "low" | "medium" | "high";

export interface AgendaOrderSummary {
  id: number;
  description: string;
  client_name: string | null;
  client_phone: string | null;
  estimated_delivery_date: string | null;
  status_id: number;
}

export interface AgendaItem {
  id: number;
  type: AgendaItemType;
  title: string;
  content: string | null;
  status: AgendaItemStatus;
  priority: AgendaItemPriority;
  due_date: string | null;
  completed_at: string | null;
  order_id: number | null;
  order?: AgendaOrderSummary | null;
  created_at: string;
  updated_at: string;
}

export interface AgendaItemFormData {
  type: AgendaItemType;
  title: string;
  content: string;
  due_date: string;
  priority: AgendaItemPriority;
  order_id: string;
}

export interface AgendaCreatePayload {
  type: AgendaItemType;
  title: string;
  content: string | null;
  due_date: string | null;
  priority: AgendaItemPriority;
  order_id: number | null;
}

export type AgendaUpdatePayload = Partial<AgendaCreatePayload> & {
  status?: AgendaItemStatus;
};

export interface AgendaFilters {
  status: AgendaItemStatus;
  type: AgendaItemType | "";
  priority: AgendaItemPriority | "";
  order_id: string;
  from: string;
  to: string;
  search: string;
}

export interface AgendaSummary {
  pendingToday: number;
  overdue: number;
  linkedToOrders: number;
}

export interface AgendaGroup {
  key: string;
  title: string;
  items: AgendaItem[];
}

export type AgendaOrderOption = Pick<
  Order,
  "id" | "description" | "client_name" | "client_phone"
>;
