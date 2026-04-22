export interface IncomeFormData {
  order_id: number;
  amount: number;
  date?: string | null;
}

export interface Income {
  id: number;
  order_id: number;
  amount: number;
  date: string;
  created_at: string;
  updated_at: string;
}
