import React from "react";
import { DashboardLayout } from "../../layouts";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";

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
  } = useOrders();
  const [isOpen, setIsOpen] = React.useState(false);

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

  return (
    <DashboardLayout>
      <OrdersHeader
        createOrder={createOrder}
        updateOrder={updateOrder}
        isOpen={isOpen}
        openCreateOrder={handleOpenCreateOrder}
        toggleModal={toggleModal}
        selectedOrder={selectedOrder}
        finishOrder={finishOrder}
      />
      <OrdersTable
        orders={orders}
        loading={loading}
        onClickRow={handleClickRow}
        finishOrder={finishOrder}
      />
    </DashboardLayout>
  );
};
