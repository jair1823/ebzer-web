import { useState, useEffect, useCallback } from "react";
import { ordersService } from "../services";

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

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

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  return { createOrder, getAllOrders, orders, loading };
};