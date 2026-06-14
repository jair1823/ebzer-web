import React from "react";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";
import { OrdersMetrics } from "./OrdersMetrics";
import { QuickFilters } from "./QuickFilters";
import type { Order, OrderFilters, QuickFilterType } from "./types";

import { useOrders } from "../../hooks";
import type { OrderFilters as ServiceOrderFilters } from "../../services";

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
    filters: serviceFilters,
    setFilters: setServiceFilters,
    clearFilters,
  } = useOrders();
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<OrderFilters>({
    dateFrom: null,
    dateTo: null,
    statuses: [],
    hideCancelled: true,
  });
  const [activeQuickFilter, setActiveQuickFilter] = React.useState<QuickFilterType>("this-month");

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

  const handleQuickFilterChange = (filterType: QuickFilterType, newFilters: ServiceOrderFilters) => {
    setActiveQuickFilter(filterType);
    
    if (filterType === "all") {
      clearFilters();
    } else if (filterType === "pending-payment") {
      // For pending payment, we need to filter client-side since it's based on payment status
      // We'll apply default month filter to backend and then filter client-side
      setServiceFilters({
        dateFrom: serviceFilters.dateFrom,
        dateTo: serviceFilters.dateTo,
      });
    } else {
      setServiceFilters(newFilters);
    }
  };

  const handleToggleHistory = () => {
    if (activeQuickFilter === "all") {
      // Si ya está en "all", volver a "this-month"
      const defaultRange = { dateFrom: serviceFilters.dateFrom, dateTo: serviceFilters.dateTo };
      setActiveQuickFilter("this-month");
      setServiceFilters(defaultRange);
    } else {
      // Mostrar todo el historial
      setActiveQuickFilter("all");
      clearFilters();
    }
  };

  const isShowingFullHistory = activeQuickFilter === "all";

  const applyFilters = (orders: Order[]): Order[] => {
    let filtered = orders.filter((order) => {
      // Hide cancelled orders if the filter is active
      if (filters.hideCancelled && order.status === "cancelled") {
        return false;
      }

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

    // Additional client-side filter for pending payment
    if (activeQuickFilter === "pending-payment") {
      filtered = filtered.filter((order) => {
        const paymentStatus = paymentStatuses.get(order.id);
        return paymentStatus && !paymentStatus.is_fully_paid;
      });
    }

    return filtered;
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
        onToggleHistory={handleToggleHistory}
        isShowingFullHistory={isShowingFullHistory}
        activeQuickFilter={activeQuickFilter}
      />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <QuickFilters
          activeFilter={activeQuickFilter}
          onFilterChange={handleQuickFilterChange}
        />

        <OrdersMetrics
          orders={filteredOrders}
          paymentStatuses={paymentStatuses}
        />
      </div>

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
