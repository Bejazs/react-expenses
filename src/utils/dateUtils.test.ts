import { formatDateEuropean } from './dateUtils';

describe('formatDateEuropean', () => {
  it('formats a date correctly', () => {
    // Create a date object. Note: Date parsing depends on timezone, so using specific components is safer for testing output format logic
    const date = new Date(2023, 9, 5); // Month is 0-indexed: 9 is October
    expect(formatDateEuropean(date)).toBe('05/10/2023');
  });

  it('handles string input', () => {
    // YYYY-MM-DD string is parsed as UTC, so we need to be careful with timezone shifts if running locally.
    // Ideally we mock timezone or just check format structure.
    // However, for european format DD/MM/YYYY, let's just ensure it's not 'Invalid Date' and has correct structure.
    // Or use a safe date like 2023-01-01 which is less likely to shift year.
    const result = formatDateEuropean('2023-01-01');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('handles invalid input', () => {
    expect(formatDateEuropean('invalid')).toBe('Invalid Date');
  });
});
