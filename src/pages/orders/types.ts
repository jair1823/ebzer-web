export type DeliveryType = "pickup" | "shipping" | "delivery";
export type OrderPlatform = "whatsapp" | "instagram" | "facebook";

export interface OrderStatusOption {
  id: number;
  name: string;
  display_name: string;
  color: string;
  order_position: number;
  is_system_status: boolean;
  is_final_status: boolean;
  is_active: boolean;
}

export interface OrderFormData {
  description: string;
  amount_charged: number;
  status_id: number | null;
  estimated_delivery_date: string | null;
  delivery_type: DeliveryType;
  platform: OrderPlatform;
  client_name: string;
  client_phone: string;
  notes: string;
}

export interface Order {
  id: number;
  description: string;
  entry_date: string;
  amount_charged: number;
  status_id: number;
  status?: OrderStatusOption;
  payment_status?: PaymentStatus;
  paid_at: string | null;
  estimated_delivery_date: string | null;
  delivery_type: DeliveryType;
  platform: OrderPlatform;
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

export interface OrdersSummary {
  monthlyIncome: number;
  activeOrders: number;
  pendingCollection: number;
  pendingPercentage: number;
  monthLabel: string;
}

export type OrdersViewMode = "table" | "cards";

export interface FinishOrderResponse {
  finished: boolean;
  income_created: boolean;
  income_id: number | null;
  amount_paid: number;
  total_paid: number;
  remaining: number;
  is_fully_paid: boolean;
  paid_at: string;
}

export interface OrderFilters {
  dateFrom: string | null;  // ISO date string (yyyy-MM-dd) or null
  dateTo: string | null;    // ISO date string (yyyy-MM-dd) or null
  status_ids: number[];     // Array of selected status IDs, empty = show all
}

// Interface for temporary incomes (before saving to backend)
export interface TemporaryIncome {
  id: string;           // UUID temporal for react keys
  amount: number;       // Income amount
  date: string | null;  // YYYY-MM-DD format (optional)
  isExisting: boolean;  // true = from backend, false = new
  backendId?: number;   // Only for existing incomes
}
