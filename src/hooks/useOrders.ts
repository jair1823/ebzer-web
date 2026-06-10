import { useState, useEffect, useCallback, useMemo } from "react";
import { ordersService } from "../services";
import type { Order, OrderFormData, PaymentStatus } from "../pages/orders/types";

const getOrderPaymentStatus = (order: Order): PaymentStatus => {
  if (order.payment_status) {
    return order.payment_status;
  }

  return {
    total_paid: 0,
    amount_charged: order.amount_charged,
    remaining: order.amount_charged,
    percentage_paid: 0,
    is_fully_paid: false,
  };
};

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const paymentStatuses = useMemo(() => {
    const statusesMap = new Map<number, PaymentStatus>();
    orders.forEach((order) => {
      statusesMap.set(order.id, getOrderPaymentStatus(order));
    });
    return statusesMap;
  }, [orders]);

  const createOrder = async (orderData: OrderFormData) => {
    return ordersService.createOrder(orderData);
  };

  const getAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ordersService.getAllOrders();
      setOrders(response);

      return response;
    } catch (error) {
      //todo handle error properly
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = async (orderId: number, orderData: OrderFormData) => {
    return ordersService.updateOrder(orderId.toString(), orderData);
  };

  const finishOrder = async (orderId: number) => {
    const response = await ordersService.finishOrder(orderId.toString());
    const refreshedOrders = await getAllOrders();
    setSelectedOrder(refreshedOrders?.find((order) => order.id === orderId) || null);
    return response;
  };

  const getPaymentStatusForOrder = (orderId: number): PaymentStatus | null => {
    return paymentStatuses.get(orderId) || null;
  };

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  return { 
    createOrder, 
    getAllOrders, 
    updateOrder, 
    finishOrder, 
    orders, 
    loading, 
    selectedOrder, 
    setSelectedOrder,
    paymentStatuses,
    getPaymentStatusForOrder,
  };
};
