import { api } from "./api";

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
