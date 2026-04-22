import type { OrderStatus } from "../pages/orders/types";

/**
 * Get human-readable label for order status
 */
export const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    confirmed: "Confirmado",
    in_progress: "En progreso",
    ready: "Listo",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return labels[status];
};

/**
 * Get background color class for order status badge
 * Uses semantic color tokens from the design system
 */
export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "confirmed":
      return "bg-info"; // azul - confirmado
    case "in_progress":
      return "bg-warning"; // amarillo - en progreso
    case "ready":
      return "bg-success"; // verde - listo
    case "shipped":
      return "bg-accent"; // cyan - enviado
    case "delivered":
      return "bg-muted"; // gris neutro - entregado (menos llamativo)
    case "cancelled":
      return "bg-danger"; // rojo - cancelado
    default:
      return "bg-surface-elevated";
  }
};

/**
 * Get complete badge classes for order status
 * Returns background and text color classes
 */
export const getStatusBadgeClasses = (status: OrderStatus): string => {
  const bgColor = getStatusColor(status);
  
  // All status badges use white text for better contrast
  const textColor = "text-white";
  
  return `${bgColor} ${textColor}`;
};
