export type DeliveryType = "pickup" | "shipping" | "delivery";
export type OrderStatus = 
  | "confirmed" 
  | "in_progress" 
  | "ready" 
  | "shipped" 
  | "delivered" 
  | "cancelled";

export interface OrderFormData {
  description: string;
  amount_charged: number;
  status: OrderStatus;
  estimated_delivery_date: string | null;
  delivery_type: DeliveryType;
  client_name: string;
  client_phone: string;
  notes: string;
}

export interface Order {
  id: number;
  description: string;
  entry_date: string;
  amount_charged: number;
  status: OrderStatus;
  estimated_delivery_date: string | null;
  delivery_type: DeliveryType;
  client_name: string;
  client_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatus {
  total_paid: number;
  amount_charged: number;
  remaining: number;
  percentage_paid: number;
  is_fully_paid: boolean;
}

export interface OrderFilters {
  dateFrom: string | null;  // ISO date string (yyyy-MM-dd) or null
  dateTo: string | null;    // ISO date string (yyyy-MM-dd) or null
  statuses: OrderStatus[];  // Array of selected statuses, empty = show all
}

// Interface for temporary incomes (before saving to backend)
export interface TemporaryIncome {
  id: string;           // UUID temporal for react keys
  amount: number;       // Income amount
  date: string | null;  // YYYY-MM-DD format (optional)
  isExisting: boolean;  // true = from backend, false = new
  backendId?: number;   // Only for existing incomes
}
