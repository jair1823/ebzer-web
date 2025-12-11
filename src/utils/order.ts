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
