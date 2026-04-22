import React from "react";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import type { Order, OrderFilters } from "./types";

import { useOrders } from "../../hooks";

export const OrdersPage: React.FC = () => {
  const {
    orders,
    loading,
    createOrder,
    selectedOrder,
    setSelectedOrder,
    updateOrder,
    finishOrder,
    paymentStatuses,
  } = useOrders();
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<OrderFilters>({
    dateFrom: null,
    dateTo: null,
    statuses: [],
  });

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleOpenCreateOrder = () => {
    setIsOpen(true);
    setSelectedOrder(null);
  };

  const handleClickRow = (orderId: number) => {
    setSelectedOrder(orders.find((order) => order.id === orderId) || null);
    toggleModal();
  };

  const applyFilters = (orders: Order[]): Order[] => {
    return orders.filter((order) => {
      // Filter by date range (using estimated_delivery_date)
      if (filters.dateFrom && order.estimated_delivery_date) {
        const orderDate = new Date(order.estimated_delivery_date);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }

      if (filters.dateTo && order.estimated_delivery_date) {
        const orderDate = new Date(order.estimated_delivery_date);
        const toDate = new Date(filters.dateTo);
        if (orderDate > toDate) return false;
      }

      // Filter by status (empty array = show all)
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(order.status)) return false;
      }

      return true;
    });
  };

  const filteredOrders = applyFilters(orders);

  return (
    <div className="py-2">
      <OrdersHeader
        filters={filters}
        setFilters={setFilters}
        createOrder={createOrder}
        updateOrder={updateOrder}
        isOpen={isOpen}
        openCreateOrder={handleOpenCreateOrder}
        toggleModal={toggleModal}
        selectedOrder={selectedOrder}
        finishOrder={finishOrder}
      />
      <OrdersTable
        orders={filteredOrders}
        loading={loading}
        onClickRow={handleClickRow}
        finishOrder={finishOrder}
        paymentStatuses={paymentStatuses}
      />
    </div>
  );
};
