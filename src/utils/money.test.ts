import { formatMoney, toLocale } from './money';

// Intl uses non-breaking spaces; normalize them for readable assertions.
const plain = (s: string) => s.replace(/[  ]/g, ' ');

describe('formatMoney', () => {
  it('formats EUR in Portuguese with comma decimals and the symbol after', () => {
    expect(plain(formatMoney(513.6, 'EUR', 'pt'))).toBe('513,60 €');
    expect(plain(formatMoney(12345.678, 'EUR', 'pt'))).toBe('12 345,68 €');
  });

  it('formats EUR in English with the symbol first', () => {
    expect(formatMoney(1234.56, 'EUR', 'en')).toBe('€1,234.56');
  });

  it('formats USD in both languages', () => {
    expect(formatMoney(1234.56, 'USD', 'en')).toBe('$1,234.56');
    expect(plain(formatMoney(64, 'USD', 'pt'))).toBe('64,00 US$');
  });

  it('always shows 2 decimal places', () => {
    expect(formatMoney(64, 'EUR', 'en')).toBe('€64.00');
  });

  it('treats invalid numbers as zero', () => {
    expect(formatMoney(Number.NaN, 'EUR', 'en')).toBe('€0.00');
  });

  it('maps app languages to locales', () => {
    expect(toLocale('pt')).toBe('pt-PT');
    expect(toLocale('pt-BR')).toBe('pt-PT');
    expect(toLocale(undefined)).toBe('en-US');
    expect(toLocale('fr')).toBe('en-US');
  });
});
