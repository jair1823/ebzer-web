/**
 * Date utility functions for order filtering and date range calculations
 */

export interface DateRange {
  from: string;
  to: string;
}

/**
 * Returns a date range for the last 30 days
 * @returns DateRange with from and to dates in YYYY-MM-DD format
 */
export function getLast30DaysRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);

  return {
    from: formatDateForAPI(from),
    to: formatDateForAPI(to),
  };
}

/**
 * Returns a date range for the last 7 days
 * @returns DateRange with from and to dates in YYYY-MM-DD format
 */
export function getLast7DaysRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);

  return {
    from: formatDateForAPI(from),
    to: formatDateForAPI(to),
  };
}

/**
 * Formats a Date object to YYYY-MM-DD string for API consumption
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date is within the last N days
 * @param dateString - Date string to check (ISO format or parseable date)
 * @param days - Number of days to check against
 * @returns true if the date is within the last N days, false otherwise
 */
export function isWithinLastNDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const nDaysAgo = new Date();
  nDaysAgo.setDate(nDaysAgo.getDate() - days);

  return date >= nDaysAgo;
}
