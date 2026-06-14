import { useState, useEffect, useCallback } from "react";
import { ordersService, type OrderFilters } from "../services";
import type { Order, OrderFormData, PaymentStatus } from "../pages/orders/types";
import { getLast30DaysRange } from "../utils";

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentStatuses, setPaymentStatuses] = useState<Map<number, PaymentStatus>>(new Map());
  const [filters, setFilters] = useState<OrderFilters>(() => {
    const defaultRange = getLast30DaysRange();
    return {
      dateFrom: defaultRange.from,
      dateTo: defaultRange.to,
    };
  });

  const createOrder = async (orderData: OrderFormData) => {
    const response = await ordersService.createOrder(orderData);
    await getAllOrders();
    return response;
  };

  const getAllOrders = useCallback(async (customFilters?: OrderFilters) => {
    setLoading(true);
    try {
      const filtersToUse = customFilters || filters;
      const response = await ordersService.getAllOrders(filtersToUse);
      setOrders(response);
      
      // Cargar payment statuses para todas las órdenes
      await loadPaymentStatuses(response);
      
      return response;
    } catch (error) {
      //todo handle error properly
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadPaymentStatuses = async (ordersList: Order[]) => {
    try {
      const statusesMap = new Map<number, PaymentStatus>();
      
      // Cargar payment status de cada orden en paralelo
      const statusPromises = ordersList.map(async (order) => {
        try {
          const status = await ordersService.getPaymentStatus(order.id.toString());
          return { orderId: order.id, status };
        } catch (error) {
          console.error(`Error loading payment status for order ${order.id}:`, error);
          // Retornar status por defecto en caso de error
          return {
            orderId: order.id,
            status: {
              total_paid: 0,
              amount_charged: order.amount_charged,
              remaining: order.amount_charged,
              percentage_paid: 0,
              is_fully_paid: false,
            },
          };
        }
      });

      const results = await Promise.all(statusPromises);
      results.forEach(({ orderId, status }) => {
        statusesMap.set(orderId, status);
      });

      setPaymentStatuses(statusesMap);
    } catch (error) {
      console.error("Error loading payment statuses:", error);
    }
  };

  const updateOrder = async (orderId: number, orderData: any) => {
    const response = await ordersService.updateOrder(orderId.toString(), orderData);
    await getAllOrders();
    setSelectedOrder(orders.find((order) => order.id === orderId) || null);
    return response;
  };

  const finishOrder = async (orderId: number) => {
    const response = await ordersService.finishOrder(orderId.toString());
    await getAllOrders();
    return response;
  };

  const getPaymentStatusForOrder = (orderId: number): PaymentStatus | null => {
    return paymentStatuses.get(orderId) || null;
  };

  const clearFilters = () => {
    setFilters({});
    getAllOrders({});
  };

  const applyFilters = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    getAllOrders(newFilters);
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
    filters,
    setFilters: applyFilters,
    clearFilters,
  };
};