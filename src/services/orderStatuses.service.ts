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

type OrderStatusesResponse =
  | OrderStatusOption[]
  | { statuses: OrderStatusOption[] };

const normalizeStatusesResponse = (
  response: OrderStatusesResponse
): OrderStatusOption[] => {
  return Array.isArray(response) ? response : response.statuses;
};

export const orderStatusesService = {
  getAll: async (): Promise<OrderStatusOption[]> => {
    const response = await api.get<OrderStatusesResponse>("/order-statuses");
    return normalizeStatusesResponse(response);
  },

  getActive: async (): Promise<OrderStatusOption[]> => {
    const response = await api.get<OrderStatusesResponse>(
      "/order-statuses?active_only=true"
    );
    return normalizeStatusesResponse(response);
  },

  getById: async (id: number): Promise<OrderStatusOption> => {
    return api.get<OrderStatusOption>(`/order-statuses/${id}`);
  },

  create: async (data: CreateOrderStatusData): Promise<OrderStatusOption> => {
    return api.post<OrderStatusOption, CreateOrderStatusData>(
      "/order-statuses",
      data
    );
  },

  update: async (id: number, data: UpdateOrderStatusData): Promise<OrderStatusOption> => {
    return api.put<OrderStatusOption, UpdateOrderStatusData>(
      `/order-statuses/${id}`,
      data
    );
  },

  deactivate: async (id: number): Promise<void> => {
    return api.delete<void>(`/order-statuses/${id}`);
  },

  reorder: async (statusOrders: ReorderItem[]): Promise<void> => {
    return api.put<void, { status_orders: ReorderItem[] }>(
      "/order-statuses/reorder",
      { status_orders: statusOrders }
    );
  },
};
