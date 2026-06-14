import type { OrderStatus } from "../pages/orders/types";

/**
 * Get human-readable label for order status
 */
export const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    new: "Nuevo",
    active: "En progreso",
    ready: "Listo",
    completed: "Entregado",
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
    case "new":
      return "bg-info"; // azul - orden nueva/confirmada
    case "active":
      return "bg-warning"; // amarillo - en progreso/producción
    case "ready":
      return "bg-success"; // verde - listo para entrega
    case "completed":
      return "bg-muted"; // gris neutro - entregado/completado
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
