import { describe, expect, it, vi } from 'vitest';

import { CalendarHeatmapChartData } from '../../../../data.js';
import { CalendarDayOfWeekEnum } from '../../../../utils/index.js';
import { generateCalendarChartData } from '../calendar-data-generator.js';

describe('Calendar Data Generator', () => {
  const mockDateFormatter = vi.fn((date: Date, format: string) => {
    if (format === 'yyyy-MM-dd') {
      return date.toISOString().split('T')[0];
    }
    if (format === 'EEEEE') {
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return dayNames[date.getDay()];
    }
    return date.toISOString();
  });

  // Create test data for January 2024 (starts on Monday)
  // January 6, 2024 is a Saturday, January 7, 2024 is a Sunday
  const testDataWithColors: CalendarHeatmapChartData = {
    type: 'calendar-heatmap',
    values: [
      { date: new Date('2024-01-01T00:00:00Z'), value: 10, blur: false, color: '#data-color-1' }, // Monday with data color
      { date: new Date('2024-01-06T00:00:00Z'), value: 15, blur: false, color: '#data-color-2' }, // Saturday with data color
      { date: new Date('2024-01-07T00:00:00Z'), value: 20, blur: false }, // Sunday without color
      { date: new Date('2024-01-08T00:00:00Z'), value: 25, blur: false }, // Monday without color
    ],
  };

  // Removed weekendHighlightConfig - now using new weekends configuration directly

  it('should prioritize weekend highlighting over data colors', () => {
    const result = generateCalendarChartData(
      testDataWithColors,
      mockDateFormatter,
      CalendarDayOfWeekEnum.SUNDAY, // Week starts on Sunday
      {
        enabled: true,
        days: [CalendarDayOfWeekEnum.SATURDAY, CalendarDayOfWeekEnum.SUNDAY],
        cellColor: '#dddddd',
        hideValues: false,
      }, // Weekend highlighting enabled
    );

    // Find the data points for our test dates
    const mondayPoint = result.find((point) => point.custom.monthDay === 1 && point.custom.hasData);
    const saturdayPoint = result.find(
      (point) => point.custom.monthDay === 6 && point.custom.hasData,
    );
    const sundayPoint = result.find((point) => point.custom.monthDay === 7 && point.custom.hasData);
    const mondayPoint2 = result.find(
      (point) => point.custom.monthDay === 8 && point.custom.hasData,
    );

    // Weekend points should have weekend highlight color (higher priority)
    expect(saturdayPoint?.color).toBe('#dddddd');
    expect(sundayPoint?.color).toBe('#dddddd');

    // Non-weekend points should keep their data colors
    expect(mondayPoint?.color).toBe('#data-color-1');
    expect(mondayPoint2?.color).toBeUndefined(); // No color in data, no weekend highlight
  });

  it('should preserve data colors when weekend highlighting is disabled', () => {
    const result = generateCalendarChartData(
      testDataWithColors,
      mockDateFormatter,
      CalendarDayOfWeekEnum.SUNDAY, // Week starts on Sunday
      { enabled: false, days: [], cellColor: undefined, hideValues: false }, // Weekend highlighting disabled
    );

    // Find the weekend points
    const saturdayPoint = result.find(
      (point) => point.custom.monthDay === 6 && point.custom.hasData,
    );
    const sundayPoint = result.find((point) => point.custom.monthDay === 7 && point.custom.hasData);
    const mondayPoint = result.find((point) => point.custom.monthDay === 1 && point.custom.hasData);

    // When weekend highlighting is disabled, data colors should be preserved
    expect(saturdayPoint?.color).toBe('#data-color-2'); // Data color preserved
    expect(sundayPoint?.color).toBeUndefined(); // No data color, no weekend highlight
    expect(mondayPoint?.color).toBe('#data-color-1'); // Data color preserved
  });

  it('should handle data without colors correctly', () => {
    const testDataNoColors: CalendarHeatmapChartData = {
      type: 'calendar-heatmap',
      values: [
        { date: new Date('2024-01-01T00:00:00Z'), value: 10, blur: false },
        { date: new Date('2024-01-06T00:00:00Z'), value: 15, blur: false },
        { date: new Date('2024-01-07T00:00:00Z'), value: 20, blur: false },
      ],
    };

    const result = generateCalendarChartData(
      testDataNoColors,
      mockDateFormatter,
      CalendarDayOfWeekEnum.SUNDAY,
      {
        enabled: true,
        days: ['saturday', 'sunday'],
        cellColor: '#weekend-highlight',
        hideValues: false,
      },
    );

    const mondayPoint = result.find((point) => point.custom.monthDay === 1 && point.custom.hasData);
    const saturdayPoint = result.find(
      (point) => point.custom.monthDay === 6 && point.custom.hasData,
    );
    const sundayPoint = result.find((point) => point.custom.monthDay === 7 && point.custom.hasData);

    // Weekends should get highlight color, non-weekends should have no color
    expect(saturdayPoint?.color).toBe('#weekend-highlight');
    expect(sundayPoint?.color).toBe('#weekend-highlight');
    expect(mondayPoint?.color).toBeUndefined(); // No data color, no weekend highlight
  });

  it('should generate correct calendar layout with proper coordinates', () => {
    const result = generateCalendarChartData(
      testDataWithColors,
      mockDateFormatter,
      CalendarDayOfWeekEnum.SUNDAY,
      { enabled: true, days: [], cellColor: undefined, hideValues: false },
    );

    // Should have cells for the entire calendar month layout
    expect(result.length).toBeGreaterThan(30); // At least the days in the month
    expect(result.length).toBeLessThanOrEqual(42); // At most 6 weeks

    // Check that data points have correct coordinates and properties
    const dataPoints = result.filter((point) => point.custom.hasData);
    expect(dataPoints).toHaveLength(4);

    // All data points should have proper structure
    dataPoints.forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThan(7);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThan(6);
      expect(point.value).toBeDefined();
      expect(point.date).toBeDefined();
      expect(point.custom.hasData).toBe(true);
      expect(typeof point.custom.monthDay).toBe('number');
    });
  });

  it('should properly handle blur property for highlight filters', () => {
    const testDataWithBlur: CalendarHeatmapChartData = {
      type: 'calendar-heatmap',
      values: [
        { date: new Date('2024-01-01T00:00:00Z'), value: 10, blur: false, color: '#normal' }, // Not blurred
        { date: new Date('2024-01-02T00:00:00Z'), value: 15, blur: true, color: '#blurred' }, // Blurred
        { date: new Date('2024-01-03T00:00:00Z'), value: 20, blur: false }, // Not blurred, no color
        { date: new Date('2024-01-04T00:00:00Z'), value: 25, blur: true }, // Blurred, no color
        { date: new Date('2024-01-05T00:00:00Z'), value: 30 }, // No blur property (undefined)
      ],
    };

    const result = generateCalendarChartData(
      testDataWithBlur,
      mockDateFormatter,
      CalendarDayOfWeekEnum.SUNDAY,
      { enabled: true, days: [], cellColor: undefined, hideValues: false },
    );

    // Find the data points for our test dates
    const day1Point = result.find((point) => point.custom.monthDay === 1 && point.custom.hasData);
    const day2Point = result.find((point) => point.custom.monthDay === 2 && point.custom.hasData);
    const day3Point = result.find((point) => point.custom.monthDay === 3 && point.custom.hasData);
    const day4Point = result.find((point) => point.custom.monthDay === 4 && point.custom.hasData);
    const day5Point = result.find((point) => point.custom.monthDay === 5 && point.custom.hasData);

    // Check blur property is correctly passed through
    expect(day1Point?.custom.blur).toBe(false);
    expect(day2Point?.custom.blur).toBe(true);
    expect(day3Point?.custom.blur).toBe(false);
    expect(day4Point?.custom.blur).toBe(true);
    expect(day5Point?.custom.blur).toBeUndefined(); // No blur property in source data

    // Check colors are preserved regardless of blur state
    expect(day1Point?.color).toBe('#normal');
    expect(day2Point?.color).toBe('#blurred');
    expect(day3Point?.color).toBeUndefined();
    expect(day4Point?.color).toBeUndefined();
    expect(day5Point?.color).toBeUndefined();
  });

  it('should handle blur property with weekend highlighting priority', () => {
    const testDataBlurWithWeekends: CalendarHeatmapChartData = {
      type: 'calendar-heatmap',
      values: [
        { date: new Date('2024-01-06T00:00:00Z'), value: 15, blur: true, color: '#data-color' }, // Saturday, blurred
        { date: new Date('2024-01-07T00:00:00Z'), value: 20, blur: false, color: '#data-color' }, // Sunday, not blurred
        { date: new Date('2024-01-08T00:00:00Z'), value: 25, blur: true }, // Monday, blurred, no data color
      ],
    };

    const result = generateCalendarChartData(
      testDataBlurWithWeekends,
      mockDateFormatter,
      CalendarDayOfWeekEnum.SUNDAY,
      {
        enabled: true,
        days: [CalendarDayOfWeekEnum.SATURDAY, CalendarDayOfWeekEnum.SUNDAY],
        cellColor: '#weekend-highlight',
        hideValues: false,
      },
    );

    const saturdayPoint = result.find(
      (point) => point.custom.monthDay === 6 && point.custom.hasData,
    );
    const sundayPoint = result.find((point) => point.custom.monthDay === 7 && point.custom.hasData);
    const mondayPoint = result.find((point) => point.custom.monthDay === 8 && point.custom.hasData);

    // Weekend highlighting should take priority over data colors, but blur should be preserved
    expect(saturdayPoint?.color).toBe('#weekend-highlight');
    expect(saturdayPoint?.custom.blur).toBe(true);

    expect(sundayPoint?.color).toBe('#weekend-highlight');
    expect(sundayPoint?.custom.blur).toBe(false);

    expect(mondayPoint?.color).toBeUndefined(); // No weekend highlight, no data color
    expect(mondayPoint?.custom.blur).toBe(true);
  });
});
