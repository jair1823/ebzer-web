import { useState, useEffect, useCallback } from "react";
import { ordersService } from "../services";

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const createOrder = async (orderData: any) => {
    const response = await ordersService.createOrder(orderData);
    await getAllOrders();
    return response;
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

  const updateOrder = async (orderId: number, orderData: any) => {
    const response = await ordersService.updateOrder(orderId.toString(), orderData);
    await getAllOrders();
    return response;
  };

  const finishOrder = async (orderId: number) => {
    const response = await ordersService.finishOrder(orderId.toString());
    await getAllOrders();
    return response;
  };

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  return { createOrder, getAllOrders, updateOrder, finishOrder, orders, loading, selectedOrder, setSelectedOrder };
};