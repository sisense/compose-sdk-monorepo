import { sanitizeDimensionId } from './utils.js';

describe('utils', () => {
  it('should sanitizeDimensionId', () => {
    expect(sanitizeDimensionId('[Table Name.Column Name (Calendar)]')).toBe(
      '[Table Name.Column Name]',
    );
    expect(sanitizeDimensionId('[Commerce.Date (Calendar)]')).toBe('[Commerce.Date]');
    expect(sanitizeDimensionId('[Commerce.Date  (Calendar) ]')).toBe(
      '[Commerce.Date  (Calendar) ]',
    );
    expect(sanitizeDimensionId('[(Calendar)]')).toBe('[(Calendar)]');
    expect(sanitizeDimensionId('[Table Name.(Calendar)]')).toBe('[Table Name.(Calendar)]');
  });
});
