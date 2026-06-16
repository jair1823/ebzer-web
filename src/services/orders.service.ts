import { api } from "./api";
import type {
  FinishOrderResponse,
  Order,
  OrderFilters,
  OrderFormData,
  PaymentStatus,
} from "../pages/orders/types";

const buildOrdersQuery = (filters?: OrderFilters): string => {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.status_ids.length > 0) params.set("status_ids", filters.status_ids.join(","));
  if (filters.dateFrom) params.set("delivery_from", filters.dateFrom);
  if (filters.dateTo) params.set("delivery_to", filters.dateTo);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.payment_status) params.set("payment_status", filters.payment_status);
  if (filters.overdue) params.set("overdue", "true");
  if (filters.amount_min.trim()) params.set("amount_min", filters.amount_min.trim());
  if (filters.amount_max.trim()) params.set("amount_max", filters.amount_max.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const ordersService = {
  createOrder: async (orderData: OrderFormData): Promise<{ id: number }> => {
    return api.post<{ id: number }, OrderFormData>("/orders", orderData);
  },
  getAllOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    return api.get<Order[]>(`/orders${buildOrdersQuery(filters)}`);
  },
  getOrderById: async (orderId: string): Promise<Order> => {
    return api.get<Order>(`/orders/${orderId}`);
  },
  getPaymentStatus: async (orderId: string): Promise<PaymentStatus> => {
    return api.get<PaymentStatus>(`/orders/${orderId}/payment-status`);
  },
  updateOrder: async (orderId: string, orderData: OrderFormData): Promise<Order> => {
    return api.put<Order, OrderFormData>(`/orders/${orderId}`, orderData);
  },
  finishOrder: async (orderId: string): Promise<FinishOrderResponse> => {
    return api.post<FinishOrderResponse, Record<string, never>>(
      `/orders/${orderId}/finish`,
      {}
    );
  },
  deleteOrder: async (orderId: string) => {
    return api.delete(`/orders/${orderId}`);
  },
};
