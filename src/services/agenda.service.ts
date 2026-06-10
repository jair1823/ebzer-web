import { api } from "./api";
import type {
  AgendaCreatePayload,
  AgendaFilters,
  AgendaItem,
  AgendaUpdatePayload,
} from "../pages/agenda/types";

const buildQueryString = (filters: AgendaFilters): string => {
  const params = new URLSearchParams();

  if (filters.status !== "pending") params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.order_id) params.set("order_id", filters.order_id);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.search.trim()) params.set("search", filters.search.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const agendaService = {
  getAll: async (filters: AgendaFilters): Promise<AgendaItem[]> => {
    return api.get<AgendaItem[]>(`/agenda-items${buildQueryString(filters)}`);
  },
  getById: async (id: number): Promise<AgendaItem> => {
    return api.get<AgendaItem>(`/agenda-items/${id}`);
  },
  create: async (data: AgendaCreatePayload): Promise<{ id: number }> => {
    return api.post<{ id: number }, AgendaCreatePayload>("/agenda-items", data);
  },
  update: async (
    id: number,
    data: AgendaUpdatePayload
  ): Promise<{ updated: boolean }> => {
    return api.patch<{ updated: boolean }, AgendaUpdatePayload>(
      `/agenda-items/${id}`,
      data
    );
  },
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    return api.delete<{ deleted: boolean }>(`/agenda-items/${id}`);
  },
  complete: async (id: number): Promise<{ completed: boolean }> => {
    return api.patch<{ completed: boolean }, Record<string, never>>(
      `/agenda-items/${id}/complete`,
      {}
    );
  },
  archive: async (id: number): Promise<{ archived: boolean }> => {
    return api.patch<{ archived: boolean }, Record<string, never>>(
      `/agenda-items/${id}/archive`,
      {}
    );
  },
};
