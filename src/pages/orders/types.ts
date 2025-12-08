export type DeliveryType = "pickup" | "shipping" | "delivery";
export type OrderStatus = "pending" | "completed" | "paid";

export interface OrderFormData {
  description: string;
  amount_charged: string;
  status: OrderStatus;
  estimated_delivery_date: string | null;
  delivery_type: DeliveryType;
  client_name: string;
  client_phone: string;
  notes: string;
  paid_50_percent: boolean;
}
