import { Currency } from '../models/Settings';

const LOCALES: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-US',
};

const formatters = new Map<string, Intl.NumberFormat>();

/**
 * Maps an app language ("pt", "en") to a full locale for number formatting.
 */
export const toLocale = (language: string | undefined): string =>
  LOCALES[(language ?? 'en').split('-')[0]] ?? 'en-US';

/**
 * Formats a monetary value with 2 decimal places for the given currency and language.
 * "1234,56 €" in PT, "€1,234.56" in EN.
 */
export const formatMoney = (value: number, currency: Currency, language?: string): string => {
  const locale = toLocale(language);
  const key = `${locale}|${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(key, formatter);
  }
  return formatter.format(Number.isFinite(value) ? value : 0);
};
