// Utilities for handling date-only strings (YYYY-MM-DD) without timezone shifts

export const isoDateStringToLocalDate = (isoOrDateString: string | null | undefined): Date | null => {
  if (!isoOrDateString) return null;
  // If string contains 'T', extract date part
  const datePart = isoOrDateString.includes("T") ? isoOrDateString.split("T")[0] : isoOrDateString;
  const parts = datePart.split("-").map((p) => Number(p));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  // Construct local date at local midnight
  return new Date(y, m - 1, d);
};

export const formatIsoDateStringToLocale = (isoOrDateString: string | null | undefined): string => {
  const d = isoDateStringToLocalDate(isoOrDateString);
  if (!d) return "";
  return d.toLocaleDateString();
};
