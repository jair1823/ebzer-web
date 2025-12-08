import React from "react";
import { DashboardLayout } from "../../layouts";
import { OrdersHeader } from "./OrdersHeader";
import { OrdersTable } from "./OrdersTable";

import { useOrders } from "../../hooks";

export const OrdersPage: React.FC = () => {
  const { orders, loading, createOrder } = useOrders();
  return (
    <DashboardLayout>
      <OrdersHeader createOrder={createOrder}/>
      <OrdersTable orders={orders} loading={loading} />
    </DashboardLayout>
  );
};
