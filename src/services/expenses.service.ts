import { api } from "./api";
import type {
  Comercio,
  ComercioFormData,
  Expense,
  ExpenseFilters,
  ExpenseFormData,
  Product,
  ProductFormData,
} from "../pages/expenses/types";

const buildExpenseQuery = (filters: ExpenseFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.comercio_id) params.set("comercio_id", String(filters.comercio_id));
  return params.toString();
};

const buildProductsQuery = (comercioId?: number) => {
  const params = new URLSearchParams();
  if (comercioId) params.set("comercio_id", String(comercioId));
  return params.toString();
};

export const expensesService = {
  createExpense: async (expenseData: ExpenseFormData): Promise<{ id: number }> => {
    return api.post<{ id: number }, ExpenseFormData>("/expenses", expenseData);
  },
  getAllExpenses: async (filters: ExpenseFilters = {}): Promise<Expense[]> => {
    const query = buildExpenseQuery(filters);
    return api.get<Expense[]>(query ? `/expenses?${query}` : "/expenses");
  },
  getExpenseById: async (expenseId: string): Promise<Expense> => {
    return api.get<Expense>(`/expenses/${expenseId}`);
  },
  updateExpense: async (
    expenseId: string,
    expenseData: ExpenseFormData
  ): Promise<{ updated: boolean }> => {
    return api.put<{ updated: boolean }, ExpenseFormData>(`/expenses/${expenseId}`, expenseData);
  },
  deleteExpense: async (expenseId: string): Promise<{ deleted: boolean }> => {
    return api.delete<{ deleted: boolean }>(`/expenses/${expenseId}`);
  },
  getComercios: async (): Promise<Comercio[]> => {
    return api.get<Comercio[]>("/comercios");
  },
  createComercio: async (comercioData: ComercioFormData): Promise<{ id: number }> => {
    return api.post<{ id: number }, ComercioFormData>("/comercios", comercioData);
  },
  updateComercio: async (
    comercioId: string,
    comercioData: ComercioFormData
  ): Promise<{ updated: boolean }> => {
    return api.put<{ updated: boolean }, ComercioFormData>(`/comercios/${comercioId}`, comercioData);
  },
  deleteComercio: async (comercioId: string): Promise<{ deleted: boolean }> => {
    return api.delete<{ deleted: boolean }>(`/comercios/${comercioId}`);
  },
  getProducts: async (comercioId?: number): Promise<Product[]> => {
    const query = buildProductsQuery(comercioId);
    return api.get<Product[]>(query ? `/products?${query}` : "/products");
  },
  createProduct: async (productData: ProductFormData): Promise<{ id: number }> => {
    return api.post<{ id: number }, ProductFormData>("/products", productData);
  },
  updateProduct: async (
    productId: string,
    productData: ProductFormData
  ): Promise<{ updated: boolean }> => {
    return api.put<{ updated: boolean }, ProductFormData>(`/products/${productId}`, productData);
  },
  deleteProduct: async (productId: string): Promise<{ deleted: boolean }> => {
    return api.delete<{ deleted: boolean }>(`/products/${productId}`);
  },
};
