import { api } from "./api";
import type { OrderStatusOption } from "../pages/orders/types";

export interface CreateOrderStatusData {
  name: string;
  display_name: string;
  color?: string;
  order_position: number;
  is_final_status: boolean;
}

export interface UpdateOrderStatusData {
  display_name?: string;
  color?: string;
  order_position?: number;
  is_final_status?: boolean;
  is_active?: boolean;
}

export interface ReorderItem {
  id: number;
  position: number;
}

export const orderStatusesService = {
  getAll: async (): Promise<OrderStatusOption[]> => {
    const response = await api.get("/order-statuses");
    return response.statuses ?? response;
  },

  getActive: async (): Promise<OrderStatusOption[]> => {
    const response = await api.get("/order-statuses?active_only=true");
    return response.statuses ?? response;
  },

  getById: async (id: number): Promise<OrderStatusOption> => {
    return api.get(`/order-statuses/${id}`);
  },

  create: async (data: CreateOrderStatusData): Promise<OrderStatusOption> => {
    return api.post("/order-statuses", data);
  },

  update: async (id: number, data: UpdateOrderStatusData): Promise<OrderStatusOption> => {
    return api.put(`/order-statuses/${id}`, data);
  },

  deactivate: async (id: number): Promise<void> => {
    return api.delete(`/order-statuses/${id}`);
  },

  reorder: async (statusOrders: ReorderItem[]): Promise<void> => {
    return api.put("/order-statuses/reorder", { status_orders: statusOrders });
  },
};
