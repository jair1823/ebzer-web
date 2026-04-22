import { api } from "./api";
import type { PaymentStatus } from "../pages/orders/types";

export const ordersService = {
  createOrder: async (orderData: any) => {
    return api.post("/orders", orderData);
  },
  getAllOrders: async () => {
    return api.get("/orders");
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
