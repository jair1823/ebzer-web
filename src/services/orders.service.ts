import { api } from "./api";
import type { PaymentStatus } from "../pages/orders/types";

export interface OrderFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export const ordersService = {
  createOrder: async (orderData: any) => {
    return api.post("/orders", orderData);
  },
  getAllOrders: async (filters?: OrderFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.dateFrom) {
      params.append("from", filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append("to", filters.dateTo);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }

    const queryString = params.toString();
    const url = queryString ? `/orders?${queryString}` : "/orders";
    
    return api.get(url);
  },
  getOrderById: async (orderId: string) => {
    return api.get(`/orders/${orderId}`);
  },
  getPaymentStatus: async (orderId: string): Promise<PaymentStatus> => {
    return api.get(`/orders/${orderId}/payment-status`);
  },
  updateOrder: async (orderId: string, orderData: any) => {
    return api.put(`/orders/${orderId}`, orderData);
  },
  finishOrder: async (orderId: string) => {
    return api.post(`/orders/${orderId}/finish`, {});
  },
  deleteOrder: async (orderId: string) => {
    return api.delete(`/orders/${orderId}`);
  },
};
