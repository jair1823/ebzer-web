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

export const formatDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateToDDMMYYYY = (date: Date | null | undefined): string => {
  if (!date || Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatIsoDateStringToLocale = (isoOrDateString: string | null | undefined): string => {
  const d = isoDateStringToLocalDate(isoOrDateString);
  if (!d) return "";
  return formatDateToDDMMYYYY(d);
};

export const formatIsoDateTimeStringToLocale = (isoOrDateString: string | null | undefined): string => {
  if (!isoOrDateString) return "";

  const date = new Date(isoOrDateString);
  if (Number.isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatDateToDDMMYYYY(date)} ${hours}:${minutes}`;
};
