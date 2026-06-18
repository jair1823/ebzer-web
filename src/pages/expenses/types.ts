export interface Comercio {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  comercio_id: number;
  comercio?: Comercio | null;
  name: string;
  default_price: number;
  created_at: string;
}

export interface ExpenseItem {
  id: number;
  expense_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Expense {
  id: number;
  comercio_id: number;
  comercio?: Comercio | null;
  description: string | null;
  date: string;
  amount: number | null;
  total: number;
  items: ExpenseItem[];
  created_at: string;
}

export interface ExpenseItemFormData {
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface ExpenseFormData {
  comercio_id: number;
  date?: string | null;
  description?: string | null;
  amount?: number | null;
  items: ExpenseItemFormData[];
}

export interface ComercioFormData {
  name: string;
  description?: string | null;
}

export interface ProductFormData {
  comercio_id: number;
  name: string;
  default_price: number;
}

export interface ExpenseFilters {
  from?: string;
  to?: string;
  comercio_id?: number;
}
