import { parseISOWithTimezoneCheck } from './parseISOWithTimezoneCheck';

describe('parseISOWithTimezoneCheck', () => {
  it('should parse ISO string with existing timezone offset', () => {
    const dateString = '2023-01-15T10:30:00+05:00';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T05:30:00.000Z');
  });

  it('should parse ISO string with Z timezone', () => {
    const dateString = '2023-01-15T10:30:00Z';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T10:30:00.000Z');
  });

  it('should append Z to ISO string without timezone', () => {
    const dateString = '2023-01-15T10:30:00';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T10:30:00.000Z');
  });

  it('should handle ISO string with milliseconds', () => {
    const dateString = '2023-01-15T10:30:00.123';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T10:30:00.123Z');
  });

  it('should handle ISO string with milliseconds and timezone', () => {
    const dateString = '2023-01-15T10:30:00.123-05:00';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T15:30:00.123Z');
  });

  it('should handle date-only string', () => {
    const dateString = '2023-01-15';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T00:00:00.000Z');
  });

  it('should handle timezone offset without colon', () => {
    const dateString = '2023-01-15T10:30:00+0500';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T05:30:00.000Z');
  });

  it('should handle negative timezone offset without colon', () => {
    const dateString = '2023-01-15T10:30:00-0500';
    const result = parseISOWithTimezoneCheck(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-15T15:30:00.000Z');
  });
});
