/**
 * Formats a date string or Date object into a locale-specific date string.
 * @param date The date to format (string or Date).
 * @param fallback The fallback string if the date is invalid.
 * @returns The formatted date string.
 */
export const formatDate = (date: string | Date, fallback: string = 'Invalid Date'): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString();
  } catch (e) {
    return fallback;
  }
};

/**
 * Formats a date string or Date object into YYYY-MM-DD format.
 * @param date The date to format (string or Date).
 * @returns The formatted date string in YYYY-MM-DD format.
 */
export const toISODateString = (date: string | Date = new Date()): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Parses a date string and returns an ISO string.
 * @param date The date string to parse.
 * @returns The ISO string or null if invalid.
 */
export const parseToISOString = (date: string): string | null => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch (e) {
    return null;
  }
};

/**
 * Safely parses a date string, number, or Date object.
 * @param date The date to parse.
 * @returns A Date object or null if invalid.
 */
export const safeParseDate = (date: string | number | Date): Date | null => {
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
};

/**
 * Formats a date string or Date object into DD/MM/YYYY format (European).
 * @param date The date to format (string or Date).
 * @returns The formatted date string.
 */
export const formatDateEuropean = (date: string | Date): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return 'Invalid Date';
  }
};
