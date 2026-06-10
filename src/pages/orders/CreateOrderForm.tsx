import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type {
  OrderFormData,
  DeliveryType,
  Order,
  TemporaryIncome,
  OrderStatusOption,
  FinishOrderResponse,
  PaymentStatus,
} from "./types";
import type { Income } from "../incomes/types";
import { ConfirmModal, Toast, StatusPicker } from "../../components";
import { useConfirmModal, useToast } from "../../hooks";
import { incomesService } from "../../services";
import { formatOrderId, formatCurrency, calculatePaymentStatus, getPaymentBadgeClasses, getPaymentBadgeText } from "../../utils";
import { OrderPaymentsSection } from "./OrderPaymentsSection";

// Helper to get today's date in YYYY-MM-DD format (local timezone)
const getTodayLocalDate = (): string => {
  return new Date().toLocaleDateString('en-CA'); // en-CA produces YYYY-MM-DD format
};

// Helper to get local date plus N days in YYYY-MM-DD format
const getLocalDatePlusDays = (days: number): string => {
  const now = new Date();
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  return local.toLocaleDateString('en-CA');
};

const initialFormData: OrderFormData = {
  description: "",
  amount_charged: 0,
  status_id: null,
  // Default estimated delivery = creation day + 3 days (do not count creation day)
  estimated_delivery_date: getLocalDatePlusDays(3),
  delivery_type: "shipping",
  client_name: "",
  client_phone: "",
  notes: "",
};


export const CreateOrderForm: React.FC<{
  isOpen: boolean;
  selectedOrder?: Order;
  createOrder: (data: OrderFormData) => Promise<{ id: number }>;
  getAllOrders: () => Promise<Order[] | undefined>;
  updateOrder: (orderId: number, data: OrderFormData) => Promise<unknown>;
  toggleModal: () => void;
  openCreateOrder: () => void;
  finishOrder: (orderId: number) => Promise<FinishOrderResponse>;
  selectedOrderPaymentStatus?: PaymentStatus | null;
  showTrigger?: boolean;
}> = ({
  isOpen = false,
  selectedOrder,
  createOrder,
  getAllOrders,
  updateOrder,
  toggleModal,
  openCreateOrder,
  finishOrder,
  selectedOrderPaymentStatus = null,
  showTrigger = true,
}) => {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [incomes, setIncomes] = useState<TemporaryIncome[]>([]);
  const [newIncomeAmount, setNewIncomeAmount] = useState<number>(0);
  const [newIncomeDate, setNewIncomeDate] = useState<string>(
    getTodayLocalDate()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track original state for change detection
  const [originalFormData, setOriginalFormData] = useState<OrderFormData>(initialFormData);
  const [originalIncomes, setOriginalIncomes] = useState<TemporaryIncome[]>([]);
  
  const {
    isOpen: isConfirmOpen,
    config,
    openConfirm,
    closeConfirm,
  } = useConfirmModal();
  const {
    isVisible: isToastVisible,
    config: toastConfig,
    hideToast,
    showSuccess,
    showError,
  } = useToast();

  const validateForm = (): boolean => {
    // description and client_name are required
    return (
      formData.description.trim() !== "" &&
      formData.client_name.trim() !== "" &&
      (selectedOrder !== undefined || formData.status_id !== null)
    );
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = (): boolean => {
    // Compare formData
    const formChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    
    // Compare incomes (only new ones matter for change detection)
    const newIncomes = incomes.filter(inc => !inc.isExisting);
    const originalNewIncomes = originalIncomes.filter(inc => !inc.isExisting);
    const incomesChanged = JSON.stringify(newIncomes) !== JSON.stringify(originalNewIncomes);
    
    return formChanged || incomesChanged;
  };

  // Load existing incomes when editing an order
  const loadIncomes = async (orderId: number) => {
    try {
      const allIncomes = await incomesService.getAllIncomes();
      const orderIncomes = allIncomes.filter((income: Income) => income.order_id === orderId);
      
      const loadedIncomes = orderIncomes.map((income: Income) => ({
        id: `existing-${income.id}`,
        amount: income.amount,
        date: income.date ? new Date(income.date).toISOString().split("T")[0] : null,
        isExisting: true,
        backendId: income.id,
      }));
      
      setIncomes(loadedIncomes);
      setOriginalIncomes(loadedIncomes);
    } catch (error) {
      console.error("Error loading incomes:", error);
    }
  };

  // Add new income to temporary list
  const handleAddIncome = () => {
    if (newIncomeAmount > 0) {
      const newIncome: TemporaryIncome = {
        id: `temp-${Date.now()}`,
        amount: newIncomeAmount,
        date: newIncomeDate || null,
        isExisting: false,
      };
      setIncomes([...incomes, newIncome]);
      setNewIncomeAmount(0);
      setNewIncomeDate(getTodayLocalDate());
    }
  };

  // Remove income from temporary list (only new ones)
  const handleRemoveIncome = (id: string) => {
    setIncomes(incomes.filter((income) => income.id !== id));
  };

  const handleCloseClick = () => {
    if (hasUnsavedChanges()) {
      openConfirm({
        title: "Cambios sin guardar",
        message: "Tienes cambios sin guardar. ¿Estás seguro de que deseas cerrar el formulario?",
        confirmText: "Cerrar sin guardar",
        cancelText: "Continuar editando",
        variant: "warning",
        onConfirm: () => {
          toggleModal();
        },
      });
    } else {
      toggleModal();
    }
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

  const handleDropdownChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value as DeliveryType,
    }));
  };

  const handleFinishClick = (orderId: number) => {
    openConfirm({
      title: "Finalizar y registrar pago",
      message:
        "Esto puede crear un ingreso por el saldo pendiente, cambiar el pedido a completado y marcarlo como pagado.",
      confirmText: "Finalizar y registrar pago",
      cancelText: "Cancelar",
      variant: "info",
      onConfirm: async () => {
        try {
          const result = await finishOrder(orderId);
          showSuccess(
            result.income_created
              ? `Pago registrado por ${formatCurrency(result.amount_paid)}`
              : "Pedido marcado como pagado"
          );
          toggleModal();
        } catch (error) {
          console.error("Error finishing order:", error);
          showError("Error al finalizar y registrar el pago");
        }
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data with all required fields for backend
      const dataToSend = {
        description: formData.description,
        amount_charged: formData.amount_charged,
        status_id: formData.status_id,
        estimated_delivery_date: formData.estimated_delivery_date
          ? new Date(`${formData.estimated_delivery_date}T00:00:00`).toISOString()
          : null,
        delivery_type: formData.delivery_type,
        client_name: formData.client_name,
        client_phone: formData.client_phone || "",
        notes: formData.notes || "",
      };
      
      let orderId: number;

      if (selectedOrder) {
        // EDIT: Update order
        await updateOrder(selectedOrder.id, dataToSend);
        orderId = selectedOrder.id;
        showSuccess("Pedido actualizado exitosamente");
      } else {
        // CREATE: Create order and get ID
        const response = await createOrder(dataToSend);
        orderId = response.id;
        showSuccess("Pedido creado exitosamente");
      }

      // Create only new incomes (isExisting: false)
      const newIncomes = incomes.filter(income => !income.isExisting);
      
      if (newIncomes.length > 0) {
        for (const income of newIncomes) {
          try {
            await incomesService.createIncome({
              order_id: orderId,
              amount: income.amount,
              date: income.date || null,
            });
          } catch (error) {
            console.error("Failed to create income:", error);
            // Continue with next income
          }
        }
        showSuccess(`${newIncomes.length} pago(s) registrado(s)`);
      }

      await getAllOrders();

      // Reset form and close modal
      setFormData(initialFormData);
      setIncomes([]);
      setNewIncomeAmount(0);
      setNewIncomeDate(getTodayLocalDate());
      setOriginalFormData(initialFormData);
      setOriginalIncomes([]);
      toggleModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      showError(
        selectedOrder
          ? "Error al actualizar el pedido"
          : "Error al crear el pedido"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (selectedOrder) {
      setFormData({
        description: selectedOrder.description || "",
        amount_charged: selectedOrder.amount_charged || 0,
        status_id: selectedOrder.status_id ?? null,
        estimated_delivery_date: selectedOrder.estimated_delivery_date
          ? ((): string => {
              const d = new Date(selectedOrder.estimated_delivery_date);
              const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
              return local.toLocaleDateString('en-CA');
            })()
          : "",
        delivery_type: selectedOrder.delivery_type || "shipping",
        client_name: selectedOrder.client_name || "",
        client_phone: selectedOrder.client_phone || "",
        notes: selectedOrder.notes || "",
      });
      // Load existing incomes when editing
      loadIncomes(selectedOrder.id);
      
      // Set original state for change detection
      const originalData = {
        description: selectedOrder.description || "",
        amount_charged: selectedOrder.amount_charged || 0,
        status_id: selectedOrder.status_id ?? null,
        estimated_delivery_date: selectedOrder.estimated_delivery_date
          ? ((): string => {
              const d = new Date(selectedOrder.estimated_delivery_date);
              const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
              return local.toLocaleDateString('en-CA');
            })()
          : "",
        delivery_type: selectedOrder.delivery_type || "shipping",
        client_name: selectedOrder.client_name || "",
        client_phone: selectedOrder.client_phone || "",
        notes: selectedOrder.notes || "",
      };
      setOriginalFormData(originalData);
    } else {
      setFormData(initialFormData);
      // Reset incomes when creating new order
      setIncomes([]);
      setNewIncomeAmount(0);
      setNewIncomeDate(getTodayLocalDate());
      setOriginalFormData(initialFormData);
      setOriginalIncomes([]);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedOrder, isOpen]);

  const isFormValid = validateForm();
  const hasChanges = hasUnsavedChanges();
  const summaryTitle = selectedOrder
    ? `Pedido #${formatOrderId(selectedOrder.id)}`
    : "Nuevo pedido";
  const summaryDescription = selectedOrder
    ? "Actualiza los detalles del encargo y revisa el estado antes de guardar."
    : "Completa la información esencial del encargo. Puedes afinar detalles después.";
  const newOrderStatusFilter = React.useCallback(
    (status: OrderStatusOption) => status.name === "new",
    []
  );
  const handleStatusChange = React.useCallback(
    (id: number) => {
      setFormData((prev) => ({ ...prev, status_id: id }));

      if (!selectedOrder) {
        setOriginalFormData((prev) => ({ ...prev, status_id: id }));
      }
    },
    [selectedOrder]
  );
  
  // Calculate payment status in real-time.
  const paymentStatus = React.useMemo(() => {
    const newIncomeTotal = incomes
      .filter((income) => !income.isExisting)
      .reduce((sum, income) => sum + income.amount, 0);

    if (selectedOrder && selectedOrderPaymentStatus) {
      const totalPaid = selectedOrderPaymentStatus.total_paid + newIncomeTotal;
      const remaining = Math.max(0, formData.amount_charged - totalPaid);
      const percentagePaid =
        formData.amount_charged > 0
          ? (totalPaid / formData.amount_charged) * 100
          : 0;

      return {
        ...selectedOrderPaymentStatus,
        total_paid: totalPaid,
        amount_charged: formData.amount_charged,
        remaining,
        percentage_paid: percentagePaid,
        is_fully_paid: remaining === 0 && totalPaid > 0,
      };
    }

    return calculatePaymentStatus(
      formData.amount_charged,
      incomes.map((income) => ({ amount: income.amount }))
    );
  }, [
    formData.amount_charged,
    incomes,
    selectedOrder,
    selectedOrderPaymentStatus,
  ]);

  return (
    <div className="relative">
      {showTrigger && (
        <button
          type="button"
          className="btn-base btn-secondary focus-primary rounded-md shadow-md"
          onClick={openCreateOrder}
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
          Nuevo pedido
        </button>
      )}
      {isOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm" style={{backgroundColor: 'rgb(var(--background) / 0.8)'}}>
          <div className="absolute inset-y-0 right-0 w-full max-w-6xl overflow-hidden bg-surface shadow-2xl">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="border-b px-6 py-5 backdrop-blur sm:px-8 bg-surface border-default">
                <div className="flex items-start justify-between gap-6">
                  <div className="max-w-2xl">
                    <p className="text-brand-primary mb-2 text-xs font-semibold uppercase tracking-[0.22em]">
                      Gestión de encargos
                    </p>
                    <h2 className="text-2xl font-semibold tracking-tight text-primary">
                      {summaryTitle}
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">
                      {summaryDescription}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseClick}
                    className="rounded-full border p-2 transition-colors border-default text-secondary hover:bg-surface-elevated"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-background">
                <div className="grid min-h-full gap-8 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:gap-10">
                  <div className="space-y-6">
                    <section className="overflow-hidden rounded-3xl shadow-sm surface-card">
                      <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="client_name"
                            className="mb-1.5 block text-sm font-medium text-primary"
                          >
                            Nombre del cliente <span className="text-danger">*</span>
                          </label>
                          <input
                            id="client_name"
                            name="client_name"
                            type="text"
                            value={formData.client_name}
                            onChange={handleChange}
                            className="input-base"
                            placeholder="Ej. Juan Pérez"
                            required
                          />
                          {!formData.client_name.trim() && (
                            <p className="mt-1.5 text-xs font-medium text-danger">
                              El nombre del cliente es obligatorio.
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="client_phone"
                            className="mb-1.5 block text-sm font-medium text-primary"
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
                            placeholder="Ej. +506 8888 9999"
                          />
                        </div>
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-3xl surface-card shadow-sm">
                      <div className="space-y-5 px-6 py-6">
                        <div>
                          <label
                            htmlFor="description"
                            className="mb-1.5 block text-sm font-medium text-primary"
                          >
                            Pedido
                          </label>
                          <input
                            id="description"
                            name="description"
                            type="text"
                            value={formData.description}
                            onChange={handleChange}
                            className="input-base"
                            placeholder="Ej. Camisetas personalizadas para evento"
                            required
                            autoFocus={!selectedOrder}
                          />
                          <p className="mt-1.5 text-xs text-secondary">
                            Resume el encargo en una sola línea clara.
                          </p>
                          {!isFormValid && (
                            <p className="mt-2 text-xs font-medium text-rose-700">
                              El campo pedido es obligatorio.
                            </p>
                          )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="amount_charged"
                              className="mb-1.5 block text-sm font-medium text-primary"
                            >
                              Total
                            </label>
                            <input
                              id="amount_charged"
                              name="amount_charged"
                              type="number"
                              min={0}
                              step="0.01"
                              value={formData.amount_charged}
                              onChange={handleChange}
                              className="input-base"
                              placeholder="0.00"
                              required
                            />
                            {formData.amount_charged > 0 && (
                              <p className="mt-1 text-xs text-secondary">
                                {formatCurrency(formData.amount_charged)}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="status_id"
                              className="mb-1.5 block text-sm font-medium text-primary"
                            >
                              Estado del pedido
                            </label>
                            <StatusPicker
                              value={formData.status_id}
                              onChange={handleStatusChange}
                              disabled={!selectedOrder}
                              statusFilter={
                                selectedOrder ? undefined : newOrderStatusFilter
                              }
                              autoSelectFirstOption={!selectedOrder}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="notes"
                            className="mb-1.5 block text-sm font-medium text-primary"
                          >
                            Notas internas
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="input-base min-h-28 resize-y"
                            placeholder="Acabados, colores, tallas, referencias o comentarios para producción."
                          />
                        </div>
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-3xl surface-card shadow-sm">
                      <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="estimated_delivery_date"
                            className="mb-1.5 block text-sm font-medium text-primary"
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
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="delivery_type"
                            className="mb-1.5 block text-sm font-medium text-primary"
                          >
                            Tipo de entrega
                          </label>
                          <select
                            id="delivery_type"
                            name="delivery_type"
                            value={formData.delivery_type}
                            onChange={handleDropdownChange}
                            className="input-base"
                          >
                            <option value="shipping">Correos</option>
                            <option value="pickup">Retiro en taller</option>
                            <option value="delivery">Delivery</option>
                          </select>
                        </div>
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
                    

                    {/* Payment Status Card */}
                    <section className="overflow-hidden rounded-3xl shadow-xl surface-elevated">
                      <div className="border-b px-6 py-4 border-subtle bg-surface-elevated">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-tertiary">
                          Estado de Pago
                        </p>
                      </div>

                      <div className="px-6 py-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${getPaymentBadgeClasses(paymentStatus)}`}>
                            {getPaymentBadgeText(paymentStatus)}
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {Math.round(paymentStatus.percentage_paid)}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-subtle rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              paymentStatus.is_fully_paid
                                ? 'bg-success'
                                : paymentStatus.percentage_paid > 0
                                ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                            style={{ width: `${Math.min(paymentStatus.percentage_paid, 100)}%` }}
                            role="progressbar"
                            aria-valuenow={paymentStatus.percentage_paid}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>

                        {/* Payment Details */}
                        <dl className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <dt className="text-secondary">Total cobrado</dt>
                            <dd className="font-semibold text-success">
                              {formatCurrency(paymentStatus.total_paid)}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="text-secondary">Por cobrar</dt>
                            <dd className="font-semibold text-danger">
                              {formatCurrency(paymentStatus.remaining)}
                            </dd>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-subtle">
                            <dt className="text-secondary">Total pedido</dt>
                            <dd className="font-bold text-primary">
                              {formatCurrency(paymentStatus.amount_charged)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </section>

                    <OrderPaymentsSection
                      incomes={incomes}
                      newIncomeAmount={newIncomeAmount}
                      newIncomeDate={newIncomeDate}
                      onIncomeAmountChange={setNewIncomeAmount}
                      onIncomeDateChange={setNewIncomeDate}
                      onAddIncome={handleAddIncome}
                      onRemoveIncome={handleRemoveIncome}
                    />
                  </aside>
                </div>
              </div>

              <div className="border-t px-6 py-4 backdrop-blur sm:px-8 bg-surface border-default">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="text-sm text-secondary">
                    Los cambios se guardan sobre el pedido actual.
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleCloseClick}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      Cancelar
                    </button>

                    {selectedOrder && selectedOrder.paid_at === null && (
                      <button
                        type="button"
                        className="btn-base btn-danger justify-center rounded-xl"
                        onClick={(e) => {
                          e.preventDefault();
                          handleFinishClick(selectedOrder.id);
                        }}
                      >
                        Finalizar y registrar pago
                      </button>
                    )}

                    <button
                      type="submit"
                      className="btn-base btn-ternary justify-center rounded-xl px-5 py-2.5"
                      disabled={
                        isSubmitting ||
                        !isFormValid ||
                        Boolean(selectedOrder && !hasChanges)
                      }
                    >
                      {isSubmitting
                        ? "Guardando..."
                        : selectedOrder
                        ? "Guardar cambios"
                        : "Crear pedido"}
                    </button>
                  </div>
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
      {/* Toast Notification */}
      <Toast
        isVisible={isToastVisible}
        onClose={hideToast}
        {...toastConfig}
      />
    </div>
  );
};
