import { useCallback, useEffect, useState } from "react";
import { agendaService } from "../services";
import type {
  AgendaCreatePayload,
  AgendaFilters,
  AgendaItem,
  AgendaUpdatePayload,
} from "../pages/agenda/types";

export const defaultAgendaFilters: AgendaFilters = {
  status: "pending",
  type: "",
  priority: "",
  order_id: "",
  from: "",
  to: "",
  search: "",
};

export const useAgendaItems = (filters: AgendaFilters) => {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getAgendaItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await agendaService.getAll(filters);
      setItems(response);
      return response;
    } catch (error) {
      console.error("Error fetching agenda items:", error);
      setItems([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createAgendaItem = async (data: AgendaCreatePayload) => {
    const response = await agendaService.create(data);
    await getAgendaItems();
    return response;
  };

  const updateAgendaItem = async (id: number, data: AgendaUpdatePayload) => {
    const response = await agendaService.update(id, data);
    await getAgendaItems();
    return response;
  };

  const completeAgendaItem = async (id: number) => {
    const response = await agendaService.complete(id);
    await getAgendaItems();
    return response;
  };

  const archiveAgendaItem = async (id: number) => {
    const response = await agendaService.archive(id);
    await getAgendaItems();
    return response;
  };

  const deleteAgendaItem = async (id: number) => {
    const response = await agendaService.delete(id);
    await getAgendaItems();
    return response;
  };

  useEffect(() => {
    getAgendaItems().catch(() => undefined);
  }, [getAgendaItems]);

  return {
    items,
    loading,
    getAgendaItems,
    createAgendaItem,
    updateAgendaItem,
    completeAgendaItem,
    archiveAgendaItem,
    deleteAgendaItem,
  };
};
