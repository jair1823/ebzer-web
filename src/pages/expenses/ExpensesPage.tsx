import React from "react";
import { Pencil, Plus, Store, Trash2, X } from "lucide-react";
import {
  canCreateComercios,
  canManageExpenseCatalog,
  canManageExpenses,
  canWriteBusinessRecords,
  useAuth,
} from "../../auth";
import { ConfirmModal, Toast } from "../../components";
import { useConfirmModal, useExpenses, useToast } from "../../hooks";
import { incomesService } from "../../services";
import {
  formatDateInputValue,
  formatIsoDateStringToLocale,
  isoDateStringToLocalDate,
} from "../../utils/date";
import type {
  Comercio,
  ComercioFormData,
  Expense,
  ExpenseFormData,
  ExpenseItemFormData,
  Product,
  ProductFormData,
} from "./types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
  }).format(value);

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const label = new Intl.DateTimeFormat("es-CR", { month: "long" }).format(now);

  return {
    from: formatDateInputValue(start),
    to: formatDateInputValue(end),
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
};

const createBlankItem = (): ExpenseItemFormData => ({
  product_name: "",
  quantity: 1,
  unit_price: 0,
});

type ExpenseEntryMode = "simple" | "products";
type CatalogMode = "comercios" | "products";

const getExpenseEntryMode = (expense?: Expense | null): ExpenseEntryMode =>
  expense?.items.length ? "products" : "simple";

const getExpenseFormData = (expense?: Expense | null): ExpenseFormData => {
  if (!expense) {
    return {
      comercio_id: 0,
      date: formatDateInputValue(new Date()),
      description: "",
      amount: 0,
      items: [],
    };
  }

  const expenseDate = isoDateStringToLocalDate(expense.date);
  const hasItems = expense.items.length > 0;
  return {
    comercio_id: expense.comercio_id,
    date: expenseDate ? formatDateInputValue(expenseDate) : null,
    description: expense.description ?? "",
    amount: hasItems ? null : expense.amount ?? expense.total ?? 0,
    items: hasItems
      ? expense.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      : [],
  };
};

const getExpenseItemsTotal = (items: ExpenseItemFormData[]) =>
  items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0);

const isPositiveInteger = (value: number) => Number.isInteger(Number(value)) && Number(value) > 0;

const getProductSummary = (expense: Expense) => {
  if (expense.items.length === 0) return "Gasto simple";
  const names = expense.items.slice(0, 2).map((item) => item.product_name).join(", ");
  if (expense.items.length <= 2) return names;
  return `${names} +${expense.items.length - 2}`;
};

const ExpenseForm: React.FC<{
  isOpen: boolean;
  selectedExpense: Expense | null;
  comercios: Comercio[];
  products: Product[];
  createExpense: (data: ExpenseFormData) => Promise<unknown>;
  updateExpense: (expenseId: number, data: ExpenseFormData) => Promise<unknown>;
  onDeleteExpense: (expense: Expense) => void;
  onClose: () => void;
  onOpen: () => void;
  canCreate: boolean;
  canDelete: boolean;
}> = ({
  isOpen,
  selectedExpense,
  comercios,
  products,
  createExpense,
  updateExpense,
  onDeleteExpense,
  onClose,
  onOpen,
  canCreate,
  canDelete,
}) => {
  const [formData, setFormData] = React.useState<ExpenseFormData>(
    getExpenseFormData(selectedExpense)
  );
  const [entryMode, setEntryMode] = React.useState<ExpenseEntryMode>(
    getExpenseEntryMode(selectedExpense)
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setFormData(getExpenseFormData(selectedExpense));
    setEntryMode(getExpenseEntryMode(selectedExpense));
  }, [selectedExpense, isOpen]);

  const comercioProducts = React.useMemo(
    () => products.filter((product) => product.comercio_id === formData.comercio_id),
    [products, formData.comercio_id]
  );
  const total = React.useMemo(
    () =>
      entryMode === "simple"
        ? Number(formData.amount || 0)
        : getExpenseItemsTotal(formData.items),
    [entryMode, formData.amount, formData.items]
  );
  const hasValidProductItems =
    formData.items.length > 0 &&
    formData.items.every(
      (item) => item.product_name.trim().length > 0 && isPositiveInteger(item.quantity) && item.unit_price > 0
    );
  const isFormValid =
    formData.comercio_id > 0 &&
    (entryMode === "simple" ? Number(formData.amount || 0) > 0 : hasValidProductItems);

  const handleModeChange = (mode: ExpenseEntryMode) => {
    setEntryMode(mode);
    setFormData((current) => ({
      ...current,
      amount: mode === "simple" ? current.amount ?? 0 : null,
      items: mode === "products" && current.items.length === 0 ? [createBlankItem()] : current.items,
    }));
  };

  const updateItem = (index: number, changes: Partial<ExpenseItemFormData>) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...changes } : item
      ),
    }));
  };

  const handleComercioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((current) => ({
      ...current,
      comercio_id: Number(event.target.value),
      items: entryMode === "products" ? [createBlankItem()] : [],
    }));
  };

  const handleProductNameChange = (index: number, value: string) => {
    const selectedProduct = comercioProducts.find(
      (product) => product.name.toLowerCase() === value.trim().toLowerCase()
    );
    updateItem(index, {
      product_name: value,
      product_id: selectedProduct?.id,
      unit_price: selectedProduct ? selectedProduct.default_price : formData.items[index].unit_price,
    });
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, createBlankItem()],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((current) => ({
      ...current,
      items: current.items.length === 1
        ? current.items
        : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    const basePayload = {
      comercio_id: formData.comercio_id,
      date: formData.date || null,
      description: formData.description?.trim() || null,
    };
    const payload: ExpenseFormData =
      entryMode === "simple"
        ? {
            ...basePayload,
            amount: Number(formData.amount),
            items: [],
          }
        : {
            ...basePayload,
            amount: null,
            items: formData.items.map((item) => ({
              product_id: item.product_id,
              product_name: item.product_name.trim(),
              quantity: Number(item.quantity),
              unit_price: Number(item.unit_price),
            })),
          };

    setIsSubmitting(true);
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, payload);
      } else {
        await createExpense(payload);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="btn-base btn-secondary focus-primary rounded-md shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onOpen}
        disabled={!canCreate}
        title={canCreate ? "Registrar gasto" : "Crea un Comercio antes de registrar gastos"}
      >
        <Plus size={14} strokeWidth={2.5} aria-hidden="true" className="mr-1" />
        Registrar gasto
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "rgb(var(--background) / 0.8)" }}>
          <div className="absolute inset-y-0 right-0 w-full max-w-4xl overflow-hidden bg-surface shadow-2xl">
            <form onSubmit={handleSubmit} className="flex h-full flex-col">
              <div className="border-b px-6 py-5 backdrop-blur sm:px-8 bg-surface border-default">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase text-brand-primary">
                      Gestor de gastos
                    </p>
                    <h2 className="text-2xl font-semibold text-primary">
                      {selectedExpense ? `Editar gasto #${selectedExpense.id}` : "Nuevo gasto"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border p-2 transition-colors border-default text-secondary hover:bg-surface-elevated"
                    aria-label="Cerrar"
                  >
                    <X size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-background">
                <div className="grid gap-5 px-6 py-6 sm:px-8">
                  <section className="overflow-hidden rounded-xl shadow-sm surface-card">
                    <div className="border-b px-6 py-5 border-subtle">
                      <h3 className="text-base font-semibold text-primary">
                        Compra
                      </h3>
                    </div>

                    <div className="grid gap-5 px-6 py-6">
                      <div>
                        <span className="mb-2 block text-sm font-medium text-primary">
                          Tipo de gasto
                        </span>
                        <div className="inline-flex rounded-md border border-subtle bg-surface-elevated p-1">
                          {[
                            { value: "simple" as const, label: "Gasto simple" },
                            { value: "products" as const, label: "Con productos" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleModeChange(option.value)}
                              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                                entryMode === option.value
                                  ? "bg-surface text-primary shadow-sm"
                                  : "text-secondary hover:text-primary"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="comercio_id" className="mb-1.5 block text-sm font-medium text-primary">
                            Comercio <span className="text-danger">*</span>
                          </label>
                          <select
                            id="comercio_id"
                            name="comercio_id"
                            value={formData.comercio_id || ""}
                            onChange={handleComercioChange}
                            className="input-base"
                            required
                          >
                            <option value="">Seleccionar Comercio</option>
                            {comercios.map((comercio) => (
                              <option key={comercio.id} value={comercio.id}>
                                {comercio.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-primary">
                            Fecha
                          </label>
                          <input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date || ""}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, date: event.target.value }))
                            }
                            className="input-base"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-primary">
                          Descripcion
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description ?? ""}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, description: event.target.value }))
                          }
                          className="input-base min-h-20"
                          placeholder="Opcional"
                        />
                      </div>

                      {entryMode === "simple" && (
                        <div>
                          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-primary">
                            Monto <span className="text-danger">*</span>
                          </label>
                          <input
                            id="amount"
                            name="amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={formData.amount || ""}
                            onChange={(event) =>
                              setFormData((current) => ({
                                ...current,
                                amount: Number(event.target.value),
                              }))
                            }
                            className="input-base"
                            required={entryMode === "simple"}
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  {entryMode === "products" && (
                    <section className="overflow-hidden rounded-xl shadow-sm surface-card">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4 border-subtle">
                        <h3 className="text-base font-semibold text-primary">Productos</h3>
                        <button type="button" onClick={addItem} className="btn-base btn-outline rounded-md text-xs px-3 py-1.5">
                          <Plus size={13} strokeWidth={2.5} aria-hidden="true" className="mr-1" />
                          Agregar producto
                        </button>
                      </div>

                    <div className="divide-y divide-subtle">
                      {formData.items.map((item, index) => {
                        const lineTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
                        const dataListID = `expense-products-${index}`;

                        return (
                          <div key={index} className="grid gap-3 px-6 py-4 lg:grid-cols-[minmax(12rem,1fr)_8rem_10rem_10rem_2rem]">
                            <div>
                              <label htmlFor={`product-${index}`} className="mb-1.5 block text-xs font-semibold uppercase text-secondary">
                                Producto
                              </label>
                              <input
                                id={`product-${index}`}
                                list={dataListID}
                                value={item.product_name}
                                onChange={(event) => handleProductNameChange(index, event.target.value)}
                                className="input-base"
                                disabled={formData.comercio_id <= 0}
                                placeholder="Escribir o seleccionar"
                                required
                              />
                              <datalist id={dataListID}>
                                {comercioProducts.map((product) => (
                                  <option key={product.id} value={product.name} />
                                ))}
                              </datalist>
                            </div>

                            <div>
                              <label htmlFor={`quantity-${index}`} className="mb-1.5 block text-xs font-semibold uppercase text-secondary">
                                Cantidad
                              </label>
                              <input
                                id={`quantity-${index}`}
                                type="number"
                                min="1"
                                step="1"
                                inputMode="numeric"
                                value={item.quantity || ""}
                                onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                                className="input-base"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor={`unit-price-${index}`} className="mb-1.5 block text-xs font-semibold uppercase text-secondary">
                                Precio
                              </label>
                              <input
                                id={`unit-price-${index}`}
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.unit_price || ""}
                                onChange={(event) => updateItem(index, { unit_price: Number(event.target.value) })}
                                className="input-base"
                                required
                              />
                            </div>

                            <div>
                              <span className="mb-1.5 block text-xs font-semibold uppercase text-secondary">
                                Linea
                              </span>
                              <div className="flex h-10 items-center text-sm font-semibold text-primary">
                                {formatCurrency(lineTotal)}
                              </div>
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                title="Eliminar producto"
                                aria-label="Eliminar producto"
                                className="mb-1 rounded-md p-2 text-secondary transition-colors hover:bg-surface-elevated hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={formData.items.length === 1}
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </section>
                  )}
                </div>
              </div>

              <div className="border-t px-6 py-4 sm:px-8 bg-surface border-default">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedExpense && canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(selectedExpense)}
                        className="btn-base btn-danger rounded-md"
                      >
                        <Trash2 size={14} strokeWidth={2.5} aria-hidden="true" className="mr-1" />
                        Eliminar gasto
                      </button>
                    )}
                    <span className="text-sm text-secondary">
                      Total: <strong className="text-primary">{formatCurrency(total)}</strong>
                    </span>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="btn-base btn-outline rounded-md">
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="btn-base btn-primary rounded-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Guardando..."
                        : selectedExpense
                          ? "Actualizar gasto"
                          : "Registrar gasto"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CatalogManager: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  comercios: Comercio[];
  products: Product[];
  expenses: Expense[];
  catalogLoading: boolean;
  catalogLoaded: boolean;
  canCreateComercio: boolean;
  canManageCatalog: boolean;
  createComercio: (data: ComercioFormData) => Promise<unknown>;
  updateComercio: (comercioId: number, data: ComercioFormData) => Promise<unknown>;
  deleteComercio: (comercioId: number) => Promise<unknown>;
  createProduct: (data: ProductFormData) => Promise<unknown>;
  updateProduct: (productId: number, data: ProductFormData) => Promise<unknown>;
  deleteProduct: (productId: number) => Promise<unknown>;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}> = ({
  isOpen,
  onClose,
  comercios,
  products,
  expenses,
  catalogLoading,
  catalogLoaded,
  canCreateComercio,
  canManageCatalog,
  createComercio,
  updateComercio,
  deleteComercio,
  createProduct,
  updateProduct,
  deleteProduct,
  showSuccess,
  showError,
}) => {
  const [comercioForm, setComercioForm] = React.useState<ComercioFormData>({
    name: "",
    description: "",
  });
  const [productForm, setProductForm] = React.useState<ProductFormData>({
    comercio_id: 0,
    name: "",
    default_price: 0,
  });
  const [editingComercio, setEditingComercio] = React.useState<Comercio | null>(null);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [catalogMode, setCatalogMode] = React.useState<CatalogMode>("comercios");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const comercioUsage = expenses.reduce<Record<number, number>>((totals, expense) => {
    totals[expense.comercio_id] = (totals[expense.comercio_id] ?? 0) + 1;
    return totals;
  }, {});
  const productUsage = expenses.reduce<Record<number, number>>((totals, expense) => {
    expense.items.forEach((item) => {
      totals[item.product_id] = (totals[item.product_id] ?? 0) + 1;
    });
    return totals;
  }, {});

  const resetComercioForm = () => {
    setEditingComercio(null);
    setComercioForm({ name: "", description: "" });
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({ comercio_id: 0, name: "", default_price: 0 });
  };

  const handleCatalogModeChange = (mode: CatalogMode) => {
    setCatalogMode(mode);
    if (mode === "comercios") {
      resetProductForm();
    } else {
      resetComercioForm();
    }
  };

  const handleComercioSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canCreateComercio || !comercioForm.name.trim() || isSubmitting) return;
    if (editingComercio && !canManageCatalog) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: comercioForm.name.trim(),
        description: comercioForm.description?.trim() || null,
      };
      if (editingComercio) {
        await updateComercio(editingComercio.id, payload);
        showSuccess("Comercio actualizado");
      } else {
        await createComercio(payload);
        showSuccess("Comercio creado");
      }
      resetComercioForm();
    } catch (error) {
      showError((error as { message?: string })?.message ?? "Error al guardar el Comercio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !canManageCatalog ||
      !productForm.name.trim() ||
      productForm.comercio_id <= 0 ||
      productForm.default_price <= 0 ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        comercio_id: productForm.comercio_id,
        name: productForm.name.trim(),
        default_price: Number(productForm.default_price),
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showSuccess("Producto actualizado");
      } else {
        await createProduct(payload);
        showSuccess("Producto creado");
      }
      resetProductForm();
    } catch (error) {
      showError((error as { message?: string })?.message ?? "Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetComercioForm();
      resetProductForm();
      setCatalogMode("comercios");
    }
  }, [isOpen]);

  if (!isOpen || (!canCreateComercio && !canManageCatalog)) return null;

  const showComerciosCatalog = !canManageCatalog || catalogMode === "comercios";
  const showProductsCatalog = canManageCatalog && catalogMode === "products";

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm m-0"  style={{ backgroundColor: "rgb(var(--background) / 0.8)" }}>
      <div className="absolute inset-y-0 right-0 w-full max-w-5xl overflow-hidden bg-surface shadow-2xl">
        <section className="flex h-full flex-col">
          <div className="border-b px-6 py-5 backdrop-blur sm:px-8 bg-surface border-default">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-md border border-subtle p-2 text-secondary">
                  <Store size={16} strokeWidth={2} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-primary">Comercios y productos</h2>
                  <p className="mt-1 text-sm text-secondary">
                    {canManageCatalog
                      ? "Administra Comercios y productos para el registro de gastos."
                      : "Crea Comercios para habilitar el registro de gastos."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border p-2 transition-colors border-default text-secondary hover:bg-surface-elevated"
                aria-label="Cerrar"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-background">
            <div className="grid gap-6 p-6 sm:p-8">
              {canManageCatalog && (
                <div>
                  <span className="mb-2 block text-sm font-medium text-primary">
                    Catalogo
                  </span>
                  <div className="inline-flex rounded-md border border-subtle bg-surface-elevated p-1">
                    {[
                      { value: "comercios" as const, label: "Comercios" },
                      { value: "products" as const, label: "Productos" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleCatalogModeChange(option.value)}
                        className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                          catalogMode === option.value
                            ? "bg-surface text-primary shadow-sm"
                            : "text-secondary hover:text-primary"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showComerciosCatalog && (
                <div className="space-y-4">
                  {canCreateComercio && (
                    <form onSubmit={handleComercioSubmit} className="grid gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-primary">Comercios</h3>
                        {editingComercio && canManageCatalog && (
                          <button type="button" onClick={resetComercioForm} className="btn-base btn-outline rounded-md text-xs px-3 py-1.5">
                            Cancelar edicion
                          </button>
                        )}
                      </div>
                      <input
                        value={comercioForm.name}
                        onChange={(event) => setComercioForm((current) => ({ ...current, name: event.target.value }))}
                        className="input-base"
                        placeholder="Nombre del Comercio"
                        autoFocus
                        required
                      />
                      <input
                        value={comercioForm.description ?? ""}
                        onChange={(event) => setComercioForm((current) => ({ ...current, description: event.target.value }))}
                        className="input-base"
                        placeholder="Descripcion opcional"
                      />
                      <button
                        type="submit"
                        disabled={!comercioForm.name.trim() || isSubmitting}
                        className="btn-base btn-primary rounded-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {editingComercio ? "Actualizar Comercio" : "Crear Comercio"}
                      </button>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-subtle">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-secondary">Nombre</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-secondary">Uso</th>
                          {canManageCatalog && (
                            <th className="relative px-3 py-2"><span className="sr-only">Acciones</span></th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-subtle">
                        {comercios.map((comercio) => (
                          <tr key={comercio.id}>
                            <td className="px-3 py-3">
                              <div className="text-sm font-medium text-primary">{comercio.name}</div>
                              {comercio.description && (
                                <div className="text-xs text-secondary">{comercio.description}</div>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm text-secondary">{comercioUsage[comercio.id] ?? 0}</td>
                            {canManageCatalog && (
                              <td className="px-3 py-3">
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    title="Editar Comercio"
                                    aria-label={`Editar Comercio ${comercio.name}`}
                                    className="rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-elevated hover:text-primary"
                                    onClick={() => {
                                      setEditingComercio(comercio);
                                      setComercioForm({
                                        name: comercio.name,
                                        description: comercio.description ?? "",
                                      });
                                    }}
                                  >
                                    <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Eliminar Comercio"
                                    aria-label={`Eliminar Comercio ${comercio.name}`}
                                    className="rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-elevated hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={(comercioUsage[comercio.id] ?? 0) > 0}
                                    onClick={async () => {
                                      try {
                                        await deleteComercio(comercio.id);
                                        showSuccess("Comercio eliminado");
                                        if (editingComercio?.id === comercio.id) resetComercioForm();
                                      } catch (error) {
                                        showError((error as { message?: string })?.message ?? "Error al eliminar el Comercio");
                                      }
                                    }}
                                  >
                                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                        {catalogLoaded && !catalogLoading && comercios.length === 0 && (
                          <tr>
                            <td colSpan={canManageCatalog ? 3 : 2} className="px-3 py-6 text-center text-sm text-secondary">
                              No hay Comercios registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {showProductsCatalog && (
                <div className="space-y-4">
                  <form onSubmit={handleProductSubmit} className="grid gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-primary">Productos</h3>
                      {editingProduct && (
                        <button type="button" onClick={resetProductForm} className="btn-base btn-outline rounded-md text-xs px-3 py-1.5">
                          Cancelar edicion
                        </button>
                      )}
                    </div>
                    <select
                      value={productForm.comercio_id || ""}
                      onChange={(event) => setProductForm((current) => ({ ...current, comercio_id: Number(event.target.value) }))}
                      className="input-base"
                      required
                    >
                      <option value="">Seleccionar Comercio</option>
                      {comercios.map((comercio) => (
                        <option key={comercio.id} value={comercio.id}>
                          {comercio.name}
                        </option>
                      ))}
                    </select>
                    <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                      <input
                        value={productForm.name}
                        onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                        className="input-base"
                        placeholder="Nombre del producto"
                        required
                      />
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={productForm.default_price || ""}
                        onChange={(event) => setProductForm((current) => ({ ...current, default_price: Number(event.target.value) }))}
                        className="input-base"
                        placeholder="Precio"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!productForm.name.trim() || productForm.comercio_id <= 0 || productForm.default_price <= 0 || isSubmitting}
                      className="btn-base btn-primary rounded-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {editingProduct ? "Actualizar producto" : "Crear producto"}
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-subtle">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-secondary">Producto</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-secondary">Precio</th>
                          <th className="relative px-3 py-2"><span className="sr-only">Acciones</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-subtle">
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-3 py-3">
                              <div className="text-sm font-medium text-primary">{product.name}</div>
                              <div className="text-xs text-secondary">{product.comercio?.name ?? "Sin Comercio"}</div>
                            </td>
                            <td className="px-3 py-3 text-sm text-secondary">{formatCurrency(product.default_price)}</td>
                            <td className="px-3 py-3">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  title="Editar producto"
                                  aria-label={`Editar producto ${product.name}`}
                                  className="rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-elevated hover:text-primary"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductForm({
                                      comercio_id: product.comercio_id,
                                      name: product.name,
                                      default_price: product.default_price,
                                    });
                                  }}
                                >
                                  <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  title="Eliminar producto"
                                  aria-label={`Eliminar producto ${product.name}`}
                                  className="rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-elevated hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={(productUsage[product.id] ?? 0) > 0}
                                  onClick={async () => {
                                    try {
                                      await deleteProduct(product.id);
                                      showSuccess("Producto eliminado");
                                      if (editingProduct?.id === product.id) resetProductForm();
                                    } catch (error) {
                                      showError((error as { message?: string })?.message ?? "Error al eliminar el producto");
                                    }
                                  }}
                                >
                                  <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-sm text-secondary">
                              No hay productos registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end border-t px-6 py-4 sm:px-8 bg-surface border-default">
            <button type="button" onClick={onClose} className="btn-base btn-outline rounded-md">
              Cerrar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const ExpensesTable: React.FC<{
  expenses: Expense[];
  loading: boolean;
  onSelectExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  canManage: boolean;
}> = ({ expenses, loading, onSelectExpense, onDeleteExpense, canManage }) => {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl shadow-sm surface-card">
        <div className="p-12 text-center">
          <p className="text-secondary">Cargando gastos...</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl shadow-sm surface-card">
        <div className="p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-primary">
            No hay gastos este mes
          </h3>
          <p className="text-secondary">
            Los gastos registrados para el mes actual apareceran aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl shadow-sm surface-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-subtle">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-secondary">Comercio</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-secondary">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-secondary">Productos</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-secondary">Total</th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="table-body divide-y divide-subtle">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className={canManage ? "table-row-interactive" : ""}
                onClick={canManage ? () => onSelectExpense(expense) : undefined}
              >
                <td className="px-6 py-4">
                  <span className="block text-sm font-medium text-primary">
                    {expense.comercio?.name ?? "Sin Comercio"}
                  </span>
                  {expense.description && (
                    <span className="block max-w-xs truncate text-xs text-secondary" title={expense.description}>
                      {expense.description}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-secondary">
                  {formatIsoDateStringToLocale(expense.date)}
                </td>
                <td className="px-6 py-4 text-sm text-secondary">
                  <span title={expense.items.map((item) => item.product_name).join(", ")}>
                    {getProductSummary(expense)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-primary">
                  {formatCurrency(expense.total)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  {canManage && (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Editar gasto"
                        aria-label={`Editar gasto #${expense.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectExpense(expense);
                        }}
                        className="rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-elevated hover:text-primary"
                      >
                        <Pencil size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar gasto"
                        aria-label={`Eliminar gasto #${expense.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteExpense(expense);
                        }}
                        className="rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-elevated hover:text-danger"
                      >
                        <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const monthRange = React.useMemo(getCurrentMonthRange, []);
  const filters = React.useMemo(
    () => ({ from: monthRange.from, to: monthRange.to }),
    [monthRange.from, monthRange.to]
  );
  const {
    expenses,
    comercios,
    products,
    loading,
    catalogLoading,
    catalogLoaded,
    selectedExpense,
    setSelectedExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    createComercio,
    updateComercio,
    deleteComercio,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useExpenses(filters);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = React.useState(false);
  const [monthlyIncome, setMonthlyIncome] = React.useState(0);
  const [isIncomeSummaryLoading, setIsIncomeSummaryLoading] = React.useState(false);
  const { isOpen: isConfirmOpen, config: confirmConfig, openConfirm, closeConfirm } = useConfirmModal();
  const { isVisible: isToastVisible, config: toastConfig, hideToast, showSuccess, showError } = useToast();

  const writeAllowed = user ? canWriteBusinessRecords(user.role) : false;
  const manageAllowed = user ? canManageExpenses(user.role) : false;
  const manageCatalogAllowed = user ? canManageExpenseCatalog(user.role) : false;
  const createComercioAllowed = user ? canCreateComercios(user.role) : false;
  const canOpenCatalogModal = createComercioAllowed || manageCatalogAllowed;
  const canCreateExpense = writeAllowed && comercios.length > 0;

  const monthlyTotal = React.useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.total, 0),
    [expenses]
  );

  const comercioTotals = React.useMemo(() => {
    const totals = new Map<number, { name: string; total: number }>();
    expenses.forEach((expense) => {
      const current = totals.get(expense.comercio_id) ?? {
        name: expense.comercio?.name ?? "Sin Comercio",
        total: 0,
      };
      current.total += expense.total;
      totals.set(expense.comercio_id, current);
    });
    return [...totals.values()].sort((a, b) => b.total - a.total);
  }, [expenses]);
  const comparisonBalance = monthlyIncome - monthlyTotal;
  const expenseRatio = monthlyIncome > 0
    ? Math.min((monthlyTotal / monthlyIncome) * 100, 100)
    : monthlyTotal > 0
      ? 100
      : 0;

  const loadMonthlyIncomes = React.useCallback(async () => {
    setIsIncomeSummaryLoading(true);
    try {
      const incomes = await incomesService.getAllIncomes(filters);
      setMonthlyIncome(incomes.reduce((sum, income) => sum + income.amount, 0));
    } catch (error) {
      console.error("Error fetching monthly incomes:", error);
      setMonthlyIncome(0);
    } finally {
      setIsIncomeSummaryLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadMonthlyIncomes();
  }, [loadMonthlyIncomes]);

  const closeForm = () => {
    setSelectedExpense(null);
    setIsFormOpen(false);
  };

  const openCreateExpense = () => {
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleSelectExpense = (expense: Expense) => {
    if (!manageAllowed) return;
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (!manageAllowed) return;

    openConfirm({
      title: "Eliminar gasto",
      message: `¿Estas seguro de que deseas eliminar el gasto #${expense.id}?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteExpense(expense.id);
          showSuccess(`Gasto #${expense.id} eliminado`);
          if (selectedExpense?.id === expense.id) closeForm();
        } catch (error) {
          showError((error as { message?: string })?.message ?? "Error al eliminar el gasto");
        }
      },
    });
  };

  const handleCreateExpense = async (data: ExpenseFormData) => {
    try {
      await createExpense(data);
      showSuccess("Gasto registrado");
    } catch (error) {
      showError((error as { message?: string })?.message ?? "Error al registrar el gasto");
      throw error;
    }
  };

  const handleUpdateExpense = async (expenseId: number, data: ExpenseFormData) => {
    try {
      await updateExpense(expenseId, data);
      showSuccess("Gasto actualizado");
    } catch (error) {
      showError((error as { message?: string })?.message ?? "Error al actualizar el gasto");
      throw error;
    }
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-xl shadow-sm surface-card">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <h1 className="text-xl font-semibold text-primary">Gastos</h1>
              <p className="mt-1 text-sm text-secondary">
                Mes actual: {monthRange.label}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canOpenCatalogModal && (
                <button
                  type="button"
                  onClick={() => setIsCatalogModalOpen(true)}
                  className="btn-base btn-outline rounded-md"
                >
                  <Store size={14} strokeWidth={2.5} aria-hidden="true" className="mr-1" />
                  {manageCatalogAllowed ? "Comercios y productos" : "Crear Comercio"}
                </button>
              )}

              {writeAllowed && (
                <ExpenseForm
                  isOpen={isFormOpen}
                  selectedExpense={selectedExpense}
                  comercios={comercios}
                  products={products}
                  createExpense={handleCreateExpense}
                  updateExpense={handleUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onClose={closeForm}
                  onOpen={openCreateExpense}
                  canCreate={canCreateExpense}
                  canDelete={manageAllowed}
                />
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_1fr_minmax(18rem,24rem)]">
          <div className="rounded-xl p-5 shadow-sm surface-card">
            <p className="text-xs font-semibold uppercase text-secondary">Gastos del mes</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {formatCurrency(monthlyTotal)}
            </p>
            <p className="mt-1 text-sm text-secondary">
              {expenses.length} compra{expenses.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-xl p-5 shadow-sm surface-card">
            <p className="text-xs font-semibold uppercase text-secondary">Por Comercio</p>
            {comercioTotals.length === 0 ? (
              <p className="mt-3 text-sm text-secondary">Sin gastos por Comercio este mes</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {comercioTotals.map((comercio) => (
                  <span
                    key={comercio.name}
                    className="inline-flex items-center gap-2 rounded-md border border-subtle px-3 py-1.5 text-sm text-primary"
                  >
                    <span>{comercio.name}</span>
                    <span className="font-semibold">{formatCurrency(comercio.total)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl p-5 shadow-sm surface-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-secondary">Ingresos vs gastos</p>
              {isIncomeSummaryLoading && (
                <span className="text-xs text-secondary">Actualizando...</span>
              )}
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-secondary">Ingresos</span>
                <span className="font-semibold text-primary">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-secondary">Gastos</span>
                <span className="font-semibold text-primary">{formatCurrency(monthlyTotal)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${expenseRatio}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t pt-2 border-subtle">
                <span className="font-medium text-primary">
                  {comparisonBalance >= 0 ? "Balance" : "Por cubrir"}
                </span>
                <span className={`font-semibold ${comparisonBalance >= 0 ? "text-brand-secondary" : "text-danger"}`}>
                  {formatCurrency(Math.abs(comparisonBalance))}
                </span>
              </div>
            </div>
          </div>
        </section>

        {catalogLoaded && !catalogLoading && comercios.length === 0 && (
          <div
            className="rounded-xl border p-5 text-sm shadow-sm bg-warning-soft"
            style={{ borderColor: "rgb(var(--warning))" }}
          >
            <p className="font-semibold text-warning">No hay Comercios registrados.</p>
            <p className="mt-1 text-warning">
              {createComercioAllowed ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCatalogModalOpen(true)}
                    className="font-semibold underline underline-offset-2 hover:text-primary"
                  >
                    Crear un Comercio
                  </button>{" "}
                  para habilitar el registro de gastos.
                </>
              ) : (
                "Un administrador u operador debe crear un Comercio antes de registrar gastos."
              )}
            </p>
          </div>
        )}

        <CatalogManager
          isOpen={isCatalogModalOpen}
          onClose={() => setIsCatalogModalOpen(false)}
          comercios={comercios}
          products={products}
          expenses={expenses}
          catalogLoading={catalogLoading}
          catalogLoaded={catalogLoaded}
          canCreateComercio={createComercioAllowed}
          canManageCatalog={manageCatalogAllowed}
          createComercio={createComercio}
          updateComercio={updateComercio}
          deleteComercio={deleteComercio}
          createProduct={createProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          showSuccess={showSuccess}
          showError={showError}
        />

        <ExpensesTable
          expenses={expenses}
          loading={loading}
          onSelectExpense={handleSelectExpense}
          onDeleteExpense={handleDeleteExpense}
          canManage={manageAllowed}
        />

        {confirmConfig && (
          <ConfirmModal isOpen={isConfirmOpen} onClose={closeConfirm} {...confirmConfig} />
        )}

        <Toast isVisible={isToastVisible} onClose={hideToast} {...toastConfig} />
      </div>
    </div>
  );
};
