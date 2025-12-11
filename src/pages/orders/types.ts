export type DeliveryType = "pickup" | "shipping" | "delivery";
export type OrderStatus = "pending" | "completed";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface OrderFormData {
  description: string;
  amount_charged: number;
  status: OrderStatus;
  estimated_delivery_date: string | null;
  delivery_type: DeliveryType;
  client_name: string;
  client_phone: string;
  notes: string;
  payment_status: PaymentStatus;
  is_paid: boolean;
}

export interface Order {
  id: number;
  description: string;
  entry_date: string;
  amount_charged: number;
  status: OrderStatus;
  estimated_delivery_date: string | null
  delivery_type: DeliveryType;
  client_name: string;
  client_phone: string;
  notes: string;
  payment_status: PaymentStatus;
  is_paid: boolean;
  
}
