import React from "react";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import type { Order, OrderFilters } from "./types";

import { useOrders } from "../../hooks";
import { isoDateStringToLocalDate } from "../../utils";

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
    getAllOrders,
  } = useOrders();
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<OrderFilters>({
    dateFrom: null,
    dateTo: null,
    status_ids: [],
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
        const orderDate = isoDateStringToLocalDate(order.estimated_delivery_date);
        const fromDate = isoDateStringToLocalDate(filters.dateFrom);
        if (orderDate && fromDate && orderDate < fromDate) return false;
      }

      if (filters.dateTo && order.estimated_delivery_date) {
        const orderDate = isoDateStringToLocalDate(order.estimated_delivery_date);
        const toDate = isoDateStringToLocalDate(filters.dateTo);
        if (orderDate && toDate && orderDate > toDate) return false;
      }

      // Filter by status_id (empty array = show all)
      if (filters.status_ids.length > 0) {
        if (!filters.status_ids.includes(order.status_id)) return false;
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
        getAllOrders={getAllOrders}
        updateOrder={updateOrder}
        isOpen={isOpen}
        openCreateOrder={handleOpenCreateOrder}
        toggleModal={toggleModal}
        selectedOrder={selectedOrder}
        finishOrder={finishOrder}
        selectedOrderPaymentStatus={
          selectedOrder ? paymentStatuses.get(selectedOrder.id) ?? null : null
        }
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
