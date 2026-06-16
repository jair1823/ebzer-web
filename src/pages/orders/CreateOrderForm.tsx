import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { toPng } from "html-to-image";
import { Download, X } from "lucide-react";
import { useBeforeUnload, useBlocker, useNavigate, useParams } from "react-router-dom";
import type {
  OrderFormData,
  DeliveryType,
  Order,
  TemporaryIncome,
  OrderStatusOption,
  PaymentStatus,
  OrderPlatform,
} from "./types";
import type { Income } from "../incomes/types";
import { ConfirmModal, PaymentBadgeContent, Toast, StatusPicker } from "../../components";
import { useConfirmModal, useToast } from "../../hooks";
import { auditService, incomesService, ordersService } from "../../services";
import { formatOrderId, formatCurrency, calculatePaymentStatus, getPaymentBadgeClasses } from "../../utils";
import { OrderPaymentsSection } from "./OrderPaymentsSection";
import { useAuth } from "../../auth";
import type { AuditEvent } from "../../services/audit.service";

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

const createInitialFormData = (): OrderFormData => ({
  description: "",
  amount_charged: 0,
  status_id: null,
  // Default estimated delivery = creation day + 3 days (do not count creation day)
  estimated_delivery_date: getLocalDatePlusDays(3),
  delivery_type: "shipping",
  platform: "whatsapp",
  client_name: "",
  client_phone: "",
  notes: "",
});

const initialFormData: OrderFormData = createInitialFormData();

const orderToFormData = (order: Order): OrderFormData => ({
  description: order.description || "",
  amount_charged: order.amount_charged || 0,
  status_id: order.status_id ?? null,
  estimated_delivery_date: order.estimated_delivery_date
    ? (() => {
        const d = new Date(order.estimated_delivery_date);
        const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return local.toLocaleDateString("en-CA");
      })()
    : "",
  delivery_type: order.delivery_type || "shipping",
  platform: order.platform || "whatsapp",
  client_name: order.client_name || "",
  client_phone: order.client_phone || "",
  notes: order.notes || "",
});

const platformOptions: Array<{ value: OrderPlatform; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

export const CreateOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderPaymentStatus, setSelectedOrderPaymentStatus] =
    useState<PaymentStatus | null>(null);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [incomes, setIncomes] = useState<TemporaryIncome[]>([]);
  const [newIncomeAmount, setNewIncomeAmount] = useState<number>(0);
  const [newIncomeDate, setNewIncomeDate] = useState<string>(
    getTodayLocalDate()
  );
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const allowNavigationRef = React.useRef(false);
  const invoiceCaptureRef = React.useRef<HTMLDivElement | null>(null);
  
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

  const hasUnsavedChanges = React.useCallback((): boolean => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);

    const newIncomes = incomes.filter((income) => !income.isExisting);
    const originalNewIncomes = originalIncomes.filter(
      (income) => !income.isExisting
    );
    const incomesChanged = JSON.stringify(newIncomes) !== JSON.stringify(originalNewIncomes);

    return formChanged || incomesChanged;
  }, [formData, incomes, originalFormData, originalIncomes]);

  const shouldBlockNavigation = React.useCallback(
    () => hasUnsavedChanges() && !allowNavigationRef.current,
    [hasUnsavedChanges]
  );
  const blocker = useBlocker(shouldBlockNavigation);

  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (!hasUnsavedChanges() || allowNavigationRef.current) {
          return;
        }

        event.preventDefault();
        event.returnValue = "";
      },
      [hasUnsavedChanges]
    )
  );

  const validateForm = (): boolean => {
    // description and client_name are required
    return (
      formData.description.trim() !== "" &&
      formData.client_name.trim() !== "" &&
      (selectedOrder !== null || formData.status_id !== null)
    );
  };

  // Load existing incomes when editing an order
  const loadIncomes = async (orderId: number): Promise<TemporaryIncome[]> => {
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
      
      return loadedIncomes;
    } catch (error) {
      console.error("Error loading incomes:", error);
      return [];
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
          allowNavigationRef.current = true;
          navigate("/orders");
        },
      });
    } else {
      allowNavigationRef.current = true;
      navigate("/orders");
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
      confirmText: "Finalizar",
      cancelText: "Cancelar",
      variant: "info",
      onConfirm: async () => {
        try {
          const result = await ordersService.finishOrder(orderId.toString());
          showSuccess(
            result.income_created
              ? `Pago registrado por ${formatCurrency(result.amount_paid)}`
              : "Pedido marcado como pagado"
          );
          allowNavigationRef.current = true;
          navigate("/orders");
        } catch (error) {
          console.error("Error finishing order:", error);
          showError("Error al finalizar y registrar el pago");
        }
      },
    });
  };

  const handleDownloadInvoiceImage = async () => {
    if (isDownloadingInvoice) {
      return;
    }

    const captureNode = invoiceCaptureRef.current;
    if (!captureNode) {
      showError("No se pudo generar la imagen");
      return;
    }

    setIsDownloadingInvoice(true);
    try {
      const pixelRatio = Math.min((window.devicePixelRatio || 1) * 2, 3);
      const backgroundColor =
        window.getComputedStyle(document.body).backgroundColor || "#ffffff";
      const dataUrl = await toPng(captureNode, {
        cacheBust: true,
        pixelRatio,
        backgroundColor,
        filter: (node) => {
          return !(
            node instanceof HTMLElement &&
            node.dataset.invoiceExclude === "true"
          );
        },
      });

      const link = document.createElement("a");
      const orderIdPart = selectedOrder
        ? formatOrderId(selectedOrder.id)
        : "nuevo";
      link.download = `pedido-${orderIdPart}-factura.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSuccess("Imagen descargada");
    } catch (error) {
      console.error("Error generating invoice image:", error);
      showError("No se pudo generar la imagen");
    } finally {
      setIsDownloadingInvoice(false);
    }
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
        platform: formData.platform,
        client_name: formData.client_name,
        client_phone: formData.client_phone || "",
        notes: formData.notes || "",
      };
      
      let orderId: number;

      if (selectedOrder) {
        // EDIT: Update order
        await ordersService.updateOrder(selectedOrder.id.toString(), dataToSend);
        orderId = selectedOrder.id;
        showSuccess("Pedido actualizado exitosamente");
      } else {
        // CREATE: Create order and get ID
        const response = await ordersService.createOrder(dataToSend);
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

      // Reset form and return to the list after incomes are saved.
      const freshInitialData = createInitialFormData();
      setFormData(freshInitialData);
      setIncomes([]);
      setNewIncomeAmount(0);
      setNewIncomeDate(getTodayLocalDate());
      setOriginalFormData(freshInitialData);
      setOriginalIncomes([]);
      allowNavigationRef.current = true;
      navigate("/orders");
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
    let isCancelled = false;
    allowNavigationRef.current = false;

    const resetCreateState = () => {
      const freshInitialData = createInitialFormData();
      setSelectedOrder(null);
      setSelectedOrderPaymentStatus(null);
      setFormData(freshInitialData);
      setIncomes([]);
      setNewIncomeAmount(0);
      setNewIncomeDate(getTodayLocalDate());
      setOriginalFormData(freshInitialData);
      setOriginalIncomes([]);
      setAuditEvents([]);
      setIsLoadingAudit(false);
      setLoadError(null);
      setIsLoadingOrder(false);
    };

    if (!id) {
      resetCreateState();
      return;
    }

    const parsedOrderId = Number(id);
    if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
      resetCreateState();
      setLoadError("Pedido inválido");
      return;
    }

    const loadOrder = async () => {
      setIsLoadingOrder(true);
      setLoadError(null);

      try {
        const order = await ordersService.getOrderById(id);
        const loadedIncomes = await loadIncomes(order.id);

        if (isCancelled) return;

        const loadedFormData = orderToFormData(order);
        setSelectedOrder(order);
        setSelectedOrderPaymentStatus(order.payment_status ?? null);
        setFormData(loadedFormData);
        setOriginalFormData(loadedFormData);
        setIncomes(loadedIncomes);
        setOriginalIncomes(loadedIncomes);
        if (user?.role === "admin") {
          setIsLoadingAudit(true);
          auditService
            .getEvents({ entity_type: "orders", entity_id: order.id })
            .then((events) => {
              if (!isCancelled) setAuditEvents(events);
            })
            .catch((error) => {
              console.error("Error loading audit events:", error);
              if (!isCancelled) setAuditEvents([]);
            })
            .finally(() => {
              if (!isCancelled) setIsLoadingAudit(false);
            });
        } else {
          setAuditEvents([]);
        }
      } catch (error) {
        console.error("Error loading order:", error);
        if (!isCancelled) {
          setLoadError("No se pudo cargar el pedido");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingOrder(false);
        }
      }
    };

    loadOrder();

    return () => {
      isCancelled = true;
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [id, user?.role]);

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

  if (isLoadingOrder) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-default bg-surface px-6 py-10 text-center text-sm text-secondary shadow-sm">
          Cargando pedido...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-default bg-surface px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-medium text-primary">{loadError}</p>
          <button
            type="button"
            className="btn-base btn-outline mt-4 rounded-md px-4 py-2 text-sm"
            onClick={() => navigate("/orders")}
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-xl border border-default bg-surface shadow-sm"
      >
              <div className="table-header border-b border-default px-6 py-5 backdrop-blur sm:px-8">
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
                    <X size={16} strokeWidth={2} aria-hidden="true" />
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

                        <fieldset className="sm:col-span-2">
                          <legend className="mb-2 block text-sm font-medium text-primary">
                            Plataforma
                          </legend>
                          <div className="grid gap-3 sm:grid-cols-3">
                            {platformOptions.map((option) => (
                              <label
                                key={option.value}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                                  formData.platform === option.value
                                    ? "border-primary bg-primary-soft text-primary"
                                    : "border-default bg-surface text-secondary hover:bg-surface-hover"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="platform"
                                  value={option.value}
                                  checked={formData.platform === option.value}
                                  onChange={handleChange}
                                  className="h-4 w-4 accent-[rgb(var(--primary))]"
                                />
                                <span>{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
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
                            <p className="mt-2 text-xs font-medium text-danger">
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
                    <button
                      type="button"
                      onClick={handleDownloadInvoiceImage}
                      disabled={isDownloadingInvoice}
                      className="btn-base btn-outline w-full justify-center gap-2 rounded-xl px-4 py-2.5"
                    >
                      <Download size={16} strokeWidth={2} aria-hidden="true" />
                      {isDownloadingInvoice ? "Generando..." : "Descargar imagen"}
                    </button>

                    <div ref={invoiceCaptureRef} className="space-y-5 bg-background">
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
                              <PaymentBadgeContent paymentStatus={paymentStatus} iconSize={16} />
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
                              <dt className="text-secondary">Pagado</dt>
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
                    </div>

                    {selectedOrder && user?.role === "admin" && (
                      <section className="overflow-hidden rounded-3xl border border-default bg-surface shadow-sm">
                        <div className="border-b border-default px-5 py-3">
                          <h3 className="text-sm font-semibold text-primary">Historial</h3>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {isLoadingAudit ? (
                            <p className="px-5 py-4 text-sm text-secondary">Cargando historial...</p>
                          ) : auditEvents.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-secondary">Sin eventos registrados</p>
                          ) : (
                            <div className="divide-y divide-[rgb(var(--border-subtle))]">
                              {auditEvents.map((event) => (
                                <div key={event.id} className="px-5 py-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="text-sm font-medium text-primary">
                                      {event.summary ?? event.action}
                                    </p>
                                    <time className="shrink-0 text-xs text-tertiary">
                                      {new Intl.DateTimeFormat("es-CR", {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      }).format(new Date(event.created_at))}
                                    </time>
                                  </div>
                                  <p className="mt-1 text-xs text-secondary">
                                    {event.actor_username ?? "Sistema"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </section>
                    )}
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
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-surface-hover"
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
                        Finalizar
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
      {/* Confirmation Modal */}
      {config && (
        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={closeConfirm}
          {...config}
        />
      )}
      <ConfirmModal
        isOpen={blocker.state === "blocked"}
        onClose={() => undefined}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. ¿Estás seguro de que deseas cerrar el formulario?"
        confirmText="Cerrar sin guardar"
        cancelText="Continuar editando"
        variant="warning"
        onConfirm={() => {
          allowNavigationRef.current = true;
          blocker.proceed?.();
        }}
        onCancel={() => {
          blocker.reset?.();
        }}
      />
      {/* Toast Notification */}
      <Toast
        isVisible={isToastVisible}
        onClose={hideToast}
        {...toastConfig}
      />
    </div>
  );
};
