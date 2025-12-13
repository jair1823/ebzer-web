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

/**
 * Format a date string to DD/MM/YYYY format
 * @param dateString - The date string to format
 * @returns String with DD/MM/YYYY format
 * @example
 * formatDate("2023-12-13") // "13/12/2023"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
