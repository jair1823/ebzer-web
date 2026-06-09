import type { OrderStatusOption } from "../pages/orders/types";

/**
 * Convert a hex color to rgba with the given opacity
 */
export const hexToRgba = (hex: string, opacity: number): string => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get the display name for a status from a list of options
 */
export const getStatusDisplayName = (
  statusId: number,
  statuses: OrderStatusOption[]
): string => {
  return statuses.find((s) => s.id === statusId)?.display_name ?? String(statusId);
};
