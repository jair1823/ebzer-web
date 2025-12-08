import React from "react";
import { CreateOrderForm } from "./CreateOrderForm";
import type { OrderFormData } from "./types";

export const OrdersHeader: React.FC<{ createOrder: (data: OrderFormData) => Promise<void> }> = ({ createOrder }) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          {/* todo filters */}
        </div>
        <div className="mt-8 lg:mt-4 lg:ml-4">
          <CreateOrderForm createOrder={createOrder} />
        </div>
      </div>
    </div>
  );
};
