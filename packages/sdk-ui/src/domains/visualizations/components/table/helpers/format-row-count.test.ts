import { formatRowCount } from './format-row-count';

describe('formatRowCount', () => {
  it('formats using the locale thousands separator', () => {
    expect(formatRowCount(3201, 'en-US')).toBe('3,201');
    expect(formatRowCount(3201, 'de-DE')).toBe('3.201');
    expect(formatRowCount(3201, 'fr-FR')).toBe('3 201');
  });

  it('returns the plain number when under the thousands threshold', () => {
    expect(formatRowCount(42, 'en-US')).toBe('42');
  });

  it('formats zero', () => {
    expect(formatRowCount(0, 'en-US')).toBe('0');
  });
});
