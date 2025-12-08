import React, { useState, type ChangeEvent, type FormEvent } from "react";
import type { OrderFormData, DeliveryType } from "./types";

const initialFormData: OrderFormData = {
  description: "",
  amount_charged: "",
  status: "pending", // always "pending" on creation
  estimated_delivery_date: "",
  delivery_type: "pickup",
  client_name: "",
  client_phone: "",
  notes: "",
  paid_50_percent: false,
};

export const CreateOrderForm: React.FC<{
  createOrder: (data: OrderFormData) => Promise<void>;
}> = ({ createOrder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const validateForm = (): boolean => {
    // description, amount_charged are required
    return (
      formData.description.trim() !== "" &&
      formData.amount_charged.trim() !== ""
    );
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

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      delivery_type: value as DeliveryType,
    }));
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

      console.log("Submitting form data:", dataToSend);
      await createOrder(dataToSend);

      //reset form
      setFormData(initialFormData);

      //close modal
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center rounded-md bg-lime-200/80 px-3 py-2 text-sm font-semibold text-slate-500 shadow-md hover:bg-lime-300/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
        onClick={toggleModal}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="stroke-slate-500" strokeLinecap="round" strokeWidth="2">
            <path d="M12 19V5" />
            <path d="M19 12H5" />
          </g>
        </svg>
        Nuevo Pedido
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
          <div className="mx-4 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            {/* header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Crear nuevo pedido
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
                {/* description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Descripción (text)
                  </label>
                  <input
                    name="description"
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Ej. Camisetas personalizadas para evento"
                    required
                  />
                </div>

                {/* amount_charged & paid_50_percent */}
                <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                  <div>
                    <label
                      htmlFor="amount_charged"
                      className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      Monto cobrado (number)
                    </label>
                    <input
                      name="amount_charged"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.amount_charged}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <input
                      name="paid_50_percent"
                      type="checkbox"
                      checked={formData.paid_50_percent}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isUrgent"
                      className="text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap"
                    >
                      50% pagado
                    </label>
                  </div>
                </div>

                {/* estimated_delivery_date */}
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
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* delivery_type */}
                <fieldset>
                  <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Tipo de entrega
                  </legend>

                  <div className="inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                    {[
                      { value: "pickup", label: "Retira" },
                      { value: "shipping", label: "Correos" },
                      { value: "delivery", label: "Delivery" },
                    ].map((option) => {
                      const isActive = formData.delivery_type === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handleRadioChange({
                              target: { value: option.value } as any,
                            } as any)
                          }
                          className={`px-3 py-1 text-sm rounded-md transition-colors
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
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Ej. Juan Pérez"
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
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Ej. +1234567890"
                    />
                  </div>
                </div>

                {/* notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Notas adicionales"
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

                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={!validateForm()}
                >
                  Crear pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
