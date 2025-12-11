import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type {
  OrderFormData,
  DeliveryType,
  OrderStatus,
  PaymentStatus,
  Order,
} from "./types";
import { ConfirmModal } from "../../components";
import { useConfirmModal } from "../../hooks";
import { formatOrderId } from "../../utils";

const initialFormData: OrderFormData = {
  description: "",
  amount_charged: 0,
  status: "pending", // always "pending" on creation
  estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 4 days from now - yyyy-MM-dd
  delivery_type: "shipping",
  client_name: "",
  client_phone: "",
  notes: "",
  payment_status: "unpaid",
  is_paid: false,
};

export const CreateOrderForm: React.FC<{
  isOpen: boolean;
  selectedOrder?: Order;
  createOrder: (data: OrderFormData) => Promise<void>;
  updateOrder: (orderId: number, data: OrderFormData) => Promise<void>;
  toggleModal: () => void;
  openCreateOrder: () => void;
  finishOrder: (orderId: number) => void;
}> = ({
  isOpen = false,
  selectedOrder,
  createOrder,
  updateOrder,
  toggleModal,
  openCreateOrder,
  finishOrder,
}) => {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [disabled, setDisabled] = useState(false);
  const {
    isOpen: isConfirmOpen,
    config,
    openConfirm,
    closeConfirm,
  } = useConfirmModal();

  const validateForm = (): boolean => {
    // description are required
    return formData.description.trim() !== "";
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      status: value as OrderStatus,
    }));
  };

  const handleDropdownChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;
    const typedValue =
      name === "delivery_type"
        ? (value as DeliveryType)
        : (value as PaymentStatus);
    setFormData((prev) => ({
      ...prev,
      [name]: typedValue,
    }));
  };

  const handleFinishClick = (orderId: number) => {
    openConfirm({
      title: "Finalizar pedido",
      message:
        "¿Estás seguro de que deseas finalizar este pedido? Esta acción no se puede deshacer.",
      confirmText: "Finalizar",
      cancelText: "Cancelar",
      variant: "info",
      onConfirm: async () => {
        finishOrder(orderId);
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    //set is submitting state
    try {
      // change to ISO 8601
      const dataToSend = {
        ...formData,
        estimated_delivery_date: formData.estimated_delivery_date
          ? new Date(formData.estimated_delivery_date).toISOString()
          : null,
      };
      // console.log("Submitting form data:", dataToSend);
      // return
      if (selectedOrder) {
        await updateOrder(selectedOrder.id, dataToSend);
      } else {
        await createOrder(dataToSend);
      }

      //reset form
      setFormData(initialFormData);

      //close modal
      toggleModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      setFormData({
        description: selectedOrder.description || "",
        amount_charged: selectedOrder.amount_charged || 0,
        status: selectedOrder.status || "pending",
        estimated_delivery_date: selectedOrder.estimated_delivery_date
          ? new Date(selectedOrder.estimated_delivery_date)
              .toISOString()
              .split("T")[0]
          : "",
        delivery_type: selectedOrder.delivery_type || "shipping",
        client_name: selectedOrder.client_name || "",
        client_phone: selectedOrder.client_phone || "",
        notes: selectedOrder.notes || "",
        payment_status: selectedOrder.payment_status || "unpaid",
        is_paid: selectedOrder.is_paid || false,
      });
      setDisabled(selectedOrder.is_paid || false);
    } else {
      setFormData(initialFormData);
      setDisabled(false);
    }
  }, [selectedOrder, isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center rounded-md bg-lime-200/80 px-3 py-2 text-sm font-semibold text-slate-500 shadow-md hover:bg-lime-300/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
        onClick={openCreateOrder}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1"
        >
          <g className="stroke-slate-500" strokeLinecap="round" strokeWidth="3">
            <path d="M12 19V5" />
            <path d="M19 12H5" />
          </g>
        </svg>
        Nuevo pedido
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
          <div className="mx-4 w-full max-h-[95vh] overflow-auto max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            {/* header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {selectedOrder ? `Pedido #${formatOrderId(selectedOrder.id)}` : "Crear nuevo pedido"}
              </h2>
              <button
                type="button"
                onClick={toggleModal}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 "
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <>
                {/* client_name & client_phone */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="client_name"
                      className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Nombre del cliente
                    </label>
                    <input
                      id="client_name"
                      name="client_name"
                      type="text"
                      value={formData.client_name}
                      onChange={handleChange}
                      className="input-base"
                      placeholder="Ej. Juan Pérez"
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="client_phone"
                      className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Teléfono del cliente
                    </label>
                    <input
                      id="client_phone"
                      name="client_phone"
                      type="tel"
                      value={formData.client_phone}
                      onChange={handleChange}
                      className="input-base"
                      placeholder="Ej. +1234567890"
                      disabled={disabled}
                    />
                  </div>
                </div>

                {/* description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Pedido
                  </label>
                  <input
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="Ej. Camisetas personalizadas para evento"
                    disabled={disabled}
                    required
                  />
                </div>

                {/* amount_charged & payment_status & status */}
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label
                      htmlFor="amount_charged"
                      className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Total
                    </label>
                    <input
                      name="amount_charged"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.amount_charged}
                      onChange={handleChange}
                      className="input-base"
                      placeholder="0.00"
                      disabled={disabled}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Estado de pago
                    </label>
                    <select
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleDropdownChange}
                      className="input-base"
                      disabled={disabled}
                    >
                      <option value="unpaid">Pendiente</option>
                      <option value="partial">Parcial</option>
                      <option value="paid">Cancelado</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    {selectedOrder && (
                      <fieldset>
                        <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                          Estado
                        </legend>

                        <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                          {[
                            { value: "pending", label: "Pendiente" },
                            { value: "completed", label: "Completado" },
                          ].map((option) => {
                            const isActive = formData.status === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                  handleRadioChange({
                                    target: {
                                      value: option.value,
                                    } as any,
                                  } as any)
                                }
                                className={`disabled-state px-3 py-1 text-sm rounded-md transition-colors
                                ${
                                  isActive
                                    ? "bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-white"
                                    : "text-slate-600 hover:text-slate-800 dark:text-slate-300"
                                }
                              `}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}
                  </div>
                </div>

                {/* estimated_delivery_date & delivery_type  */}
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label
                      htmlFor="estimated_delivery_date"
                      className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Fecha estimada de entrega
                    </label>
                    <input
                      id="estimated_delivery_date"
                      name="estimated_delivery_date"
                      type="date"
                      value={formData.estimated_delivery_date || ""}
                      onChange={handleChange}
                      className="input-base"
                      disabled={disabled}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Tipo de entrega
                    </label>

                    <select
                      name="delivery_type"
                      value={formData.delivery_type}
                      onChange={handleDropdownChange}
                      className="input-base"
                      disabled={disabled}
                    >
                      <option value="shipping">Correos</option>
                      <option value="pickup">Retiro en taller</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                </div>

                {/* notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="Notas adicionales"
                    disabled={disabled}
                  />
                </div>
              </>
              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-4">
                  {selectedOrder && !disabled && (
                    <button
                      type="button"
                      className="btn-base btn-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFinishClick(selectedOrder.id);
                      }}
                    >
                      Finalizar Pedido
                    </button>
                  )}

                  <button
                    type="submit"
                    className="btn-base btn-ternary"
                    disabled={!validateForm()}
                  >
                    {selectedOrder ? "Guardar" : "Crear"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {config && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={closeConfirm}
          {...config}
        />
      )}
    </div>
  );
};
