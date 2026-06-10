import { api } from "./api";
import type {
  FinishOrderResponse,
  Order,
  OrderFormData,
  PaymentStatus,
} from "../pages/orders/types";

export const ordersService = {
  createOrder: async (orderData: OrderFormData): Promise<{ id: number }> => {
    return api.post<{ id: number }, OrderFormData>("/orders", orderData);
  },
  getAllOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>("/orders");
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
