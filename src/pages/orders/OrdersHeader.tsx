import React from "react";
import { CreateOrderForm } from "./CreateOrderForm";
import type { Order, OrderFormData } from "./types";

export const OrdersHeader: React.FC<{
  isOpen: boolean;
  selectedOrder?: Order | null;
  createOrder: (data: OrderFormData) => Promise<void>;
  updateOrder: (orderId: number, data: OrderFormData) => Promise<void>;
  toggleModal: () => void;
  openCreateOrder: () => void;
  finishOrder: (orderId: number) => void;
}> = ({ createOrder, updateOrder, isOpen, toggleModal, selectedOrder, openCreateOrder, finishOrder }) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="min-w-0">{/* todo filters */}</div>
        <div className="mt-8 lg:mt-4 lg:ml-4">
          <CreateOrderForm
            isOpen={isOpen}
            selectedOrder={selectedOrder || undefined}
            createOrder={createOrder}
            toggleModal={toggleModal}
            openCreateOrder={openCreateOrder}
            updateOrder={updateOrder}
            finishOrder={finishOrder}
          />
        </div>
      </div>
    </div>
  );
};
