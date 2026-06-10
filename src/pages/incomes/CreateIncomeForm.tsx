import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { IncomeFormData, Income } from "./types";
import { Toast } from "../../components";
import { useToast } from "../../hooks";

const initialFormData: IncomeFormData = {
  order_id: 0,
  amount: 0,
  date: null,
};

const formatAmountPreview = (value: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

export const CreateIncomeForm: React.FC<{
  isOpen: boolean;
  selectedIncome?: Income | null;
  createIncome: (data: IncomeFormData) => Promise<unknown>;
  updateIncome: (incomeId: number, data: IncomeFormData) => Promise<unknown>;
  toggleModal: () => void;
  openCreateIncome: () => void;
}> = ({
  isOpen = false,
  selectedIncome,
  createIncome,
  updateIncome,
  toggleModal,
  openCreateIncome,
}) => {
  const [formData, setFormData] = useState<IncomeFormData>(initialFormData);
  const {
    isVisible: isToastVisible,
    config: toastConfig,
    hideToast,
    showSuccess,
    showError,
  } = useToast();

  const validateForm = (): boolean => {
    return formData.order_id > 0 && formData.amount > 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "order_id" || name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend: IncomeFormData = {
        order_id: formData.order_id,
        amount: formData.amount,
        date: formData.date || null,
      };

      if (selectedIncome) {
        await updateIncome(selectedIncome.id, dataToSend);
        showSuccess("Ingreso actualizado exitosamente");
      } else {
        await createIncome(dataToSend);
        showSuccess("Ingreso registrado exitosamente");
        setFormData(initialFormData);
        toggleModal();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(
        selectedIncome
          ? "Error al actualizar el ingreso"
          : "Error al registrar el ingreso"
      );
    }
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (selectedIncome) {
      setFormData({
        order_id: selectedIncome.order_id,
        amount: selectedIncome.amount,
        date: selectedIncome.date
          ? new Date(selectedIncome.date).toISOString().split("T")[0]
          : null,
      });
    } else {
      setFormData(initialFormData);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedIncome, isOpen]);

  const isFormValid = validateForm();

  return (
    <div className="relative">
      <button
        type="button"
        className="btn-base btn-secondary focus-primary rounded-md shadow-md"
        onClick={openCreateIncome}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1"
        >
          <g className="stroke-slate-600" strokeLinecap="round" strokeWidth="3">
            <path d="M12 19V5" />
            <path d="M19 12H5" />
          </g>
        </svg>
        Registrar ingreso
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm" style={{backgroundColor: 'rgb(var(--background) / 0.8)'}}>
          <div className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-hidden bg-surface shadow-2xl">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="border-b px-6 py-5 backdrop-blur sm:px-8 bg-surface border-default">
                <div className="flex items-start justify-between gap-6">
                  <div className="max-w-2xl">
                    <p className="text-brand-primary mb-2 text-xs font-semibold uppercase tracking-[0.22em]">
                      Gestor de ingresos
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-primary">
                      {selectedIncome ? `Editar ingreso #${selectedIncome.id}` : "Nuevo ingreso"}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">
                      {selectedIncome 
                        ? "Actualiza los detalles del pago recibido."
                        : "Registra un nuevo pago recibido de un pedido."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleModal}
                    className="rounded-full border p-2 transition-colors border-default text-secondary hover:bg-surface-elevated"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-background">
                <div className="px-6 py-6 sm:px-8">
                  <section className="overflow-hidden rounded-3xl shadow-sm surface-card">
                    <div className="border-b px-6 py-5 border-subtle">
                      <h3 className="text-base font-semibold text-primary">
                        Detalles del ingreso
                      </h3>
                      <p className="mt-1 text-sm text-secondary">
                        Información del pago recibido.
                      </p>
                    </div>

                    <div className="grid gap-5 px-6 py-6">
                      <div>
                        <label
                          htmlFor="order_id"
                          className="mb-1.5 block text-sm font-medium text-primary"
                        >
                          Número de pedido <span className="text-danger">*</span>
                        </label>
                        <input
                          id="order_id"
                          name="order_id"
                          type="number"
                          min="1"
                          value={formData.order_id || ""}
                          onChange={handleChange}
                          className="input-base"
                          placeholder="Ej. 123"
                          required
                        />
                        {formData.order_id <= 0 && (
                          <p className="mt-1.5 text-xs font-medium text-danger">
                            Ingresa un número de pedido válido.
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="amount"
                          className="mb-1.5 block text-sm font-medium text-primary"
                        >
                          Monto <span className="text-danger">*</span>
                        </label>
                        <input
                          id="amount"
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.amount || ""}
                          onChange={handleChange}
                          className="input-base"
                          placeholder="Ej. 5000.00"
                          required
                        />
                        {formData.amount > 0 && (
                          <p className="mt-1.5 text-xs text-secondary">
                            {formatAmountPreview(formData.amount)}
                          </p>
                        )}
                        {formData.amount <= 0 && (
                          <p className="mt-1.5 text-xs font-medium text-danger">
                            El monto debe ser mayor a cero.
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="date"
                          className="mb-1.5 block text-sm font-medium text-primary"
                        >
                          Fecha del pago
                        </label>
                        <input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date || ""}
                          onChange={handleChange}
                          className="input-base"
                        />
                        <p className="mt-1.5 text-xs text-secondary">
                          Opcional. Si no se especifica, se usará la fecha actual.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="border-t px-6 py-4 sm:px-8 bg-surface border-default">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="btn-base btn-outline rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="btn-base btn-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedIncome ? "Actualizar ingreso" : "Registrar ingreso"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast
        message={toastConfig.message}
        isVisible={isToastVisible}
        onClose={hideToast}
        variant={toastConfig.variant}
      />
    </div>
  );
};
