/**
 * @fileoverview Unit tests for calendar utilities
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DateFormatter } from '@/shared/formatters/create-date-formatter.js';

import { CalendarDayOfWeekEnum, getWeekdayLabels } from './calendar-utils.js';

describe('Calendar Utils', () => {
  // Mock date formatter for testing
  const mockDateFormatter: DateFormatter = vi.fn((date: Date, format: string) => {
    if (format === 'EEEEE') {
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return dayNames[date.getDay()];
    }
    return date.toISOString();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWeekdayLabels', () => {
    it('should return different order for Sunday vs Monday start', () => {
      const sundayLabels = getWeekdayLabels(CalendarDayOfWeekEnum.SUNDAY, mockDateFormatter);
      const mondayLabels = getWeekdayLabels(CalendarDayOfWeekEnum.MONDAY, mockDateFormatter);

      // Sunday first should start with Sunday (S)
      expect(sundayLabels[0]).toBe('S'); // Sunday
      expect(sundayLabels[1]).toBe('M'); // Monday

      // Monday first should start with Monday (M)
      expect(mondayLabels[0]).toBe('M'); // Monday
      expect(mondayLabels[1]).toBe('T'); // Tuesday
      expect(mondayLabels[6]).toBe('S'); // Sunday should be last
    });
  });
});
