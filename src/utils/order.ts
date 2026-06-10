import type { Order } from "../pages/orders/types";
import { isoDateStringToLocalDate } from "./date";

/**
 * Fomat a number ID to a 5-digit format with leading zeros
 * @param id - The numeric ID to format
 * @returns String with 5 digits, padded with leading zeros
 * @example
 * formatOrderId(1) // "00001"
 * formatOrderId(20) // "00020"
 * formatOrderId(139) // "00139"
 * formatOrderId(12345) // "12345"
 */
export const formatOrderId = (id: number | string): string => {
  return String(id).padStart(5, "0");
};

/**
 * Format a number to Costa Rican currency format (Colón)
 * @param amount - The numeric amount to format
 * @returns String with currency format ₡1 000 000,00
 * @example
 * formatCurrency(1000000) // "₡1 000 000,00"
 * formatCurrency(1500.5) // "₡1 500,50"
 * formatCurrency(0) // "₡0,00"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const isPaidCompletedOrder = (order: Order): boolean => {
  return order.paid_at !== null && order.status?.name === "completed";
};

const getEstimatedDeliveryTimestamp = (order: Order): number | null => {
  const date = isoDateStringToLocalDate(order.estimated_delivery_date);
  return date ? date.getTime() : null;
};

export const sortOrdersForTable = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    const aIsPaidCompleted = isPaidCompletedOrder(a);
    const bIsPaidCompleted = isPaidCompletedOrder(b);

    if (aIsPaidCompleted !== bIsPaidCompleted) {
      return aIsPaidCompleted ? 1 : -1;
    }

    const aDeliveryDate = getEstimatedDeliveryTimestamp(a);
    const bDeliveryDate = getEstimatedDeliveryTimestamp(b);

    if (
      aDeliveryDate !== null &&
      bDeliveryDate !== null &&
      aDeliveryDate !== bDeliveryDate
    ) {
      return bDeliveryDate - aDeliveryDate;
    }

    if (aDeliveryDate === null && bDeliveryDate !== null) return 1;
    if (aDeliveryDate !== null && bDeliveryDate === null) return -1;

    return b.id - a.id;
  });
};
