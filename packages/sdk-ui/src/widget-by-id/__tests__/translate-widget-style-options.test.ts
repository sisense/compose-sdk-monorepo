import { describe, expect, it } from 'vitest';

import { CalendarHeatmapStyleOptions } from '@/types';

import { extractStyleOptions } from '../translate-widget-style-options';
import { CalendarHeatmapWidgetStyle, WidgetDto } from '../types';

const mockWidgetDto = (style: CalendarHeatmapWidgetStyle): WidgetDto => {
  return {
    oid: 'test-widget-id',
    type: 'heatmap',
    subtype: 'heatmap',
    title: 'Test Calendar Heatmap',
    desc: 'Test description',
    datasource: { title: 'Test DataSource', live: false },
    style,
    metadata: {
      panels: [],
    },
  } as WidgetDto;
};

describe('extractStyleOptions for CalendarHeatmapChart', () => {
  it('should extract calendar heatmap style options with startMonth', () => {
    const widgetStyle: CalendarHeatmapWidgetStyle = {
      dayNameEnabled: true,
      dayNumberEnabled: false,
      'domain/quarter': true,
      'week/monday': true,
      grayoutEnabled: true,
      startMonth: {
        year: 2023,
        month: 6, // July (0-based, where 6 = July)
      },
    };

    const result = extractStyleOptions(
      'heatmap',
      mockWidgetDto(widgetStyle),
    ) as CalendarHeatmapStyleOptions;

    expect(result.viewType).toBe('quarter');
    expect(result.startOfWeek).toBe('monday');
    expect(result.cellLabels?.enabled).toBe(false);
    expect(result.dayLabels?.enabled).toBe(true);
    expect(result.weekends?.days).toEqual(['saturday', 'sunday']);
    expect(result.pagination?.enabled).toBe(true);
    expect(result.pagination?.startMonth).toEqual(new Date(2023, 6, 1)); // July 1st, 2023 (month 6 = July in 0-based)
  });

  it('should extract calendar heatmap style options without startMonth', () => {
    const widgetStyle: CalendarHeatmapWidgetStyle = {
      dayNameEnabled: false,
      dayNumberEnabled: true,
      'domain/year': true,
      'week/sunday': true,
      grayoutEnabled: false,
    };

    const result = extractStyleOptions(
      'heatmap',
      mockWidgetDto(widgetStyle),
    ) as CalendarHeatmapStyleOptions;

    expect(result.viewType).toBe('year');
    expect(result.startOfWeek).toBe('sunday');
    expect(result.cellLabels?.enabled).toBe(true);
    expect(result.dayLabels?.enabled).toBe(false);
    expect(result.weekends?.days).toEqual([]);
    expect(result.pagination?.enabled).toBe(true);
    expect(result.pagination?.startMonth).toBeUndefined();
  });

  it('should handle edge case with startMonth at year boundary', () => {
    const widgetStyle: CalendarHeatmapWidgetStyle = {
      startMonth: {
        year: 2024,
        month: 1, // February (0-based, where 1 = February)
      },
    };

    const result = extractStyleOptions(
      'heatmap',
      mockWidgetDto(widgetStyle),
    ) as CalendarHeatmapStyleOptions;

    expect(result.pagination?.startMonth).toEqual(new Date(2024, 1, 1)); // February 1st, 2024
  });

  it('should handle edge case with startMonth at December', () => {
    const widgetStyle: CalendarHeatmapWidgetStyle = {
      startMonth: {
        year: 2023,
        month: 12, // January of next year (0-based, where 12 = January of next year)
      },
    };

    const result = extractStyleOptions(
      'heatmap',
      mockWidgetDto(widgetStyle),
    ) as CalendarHeatmapStyleOptions;

    expect(result.pagination?.startMonth).toEqual(new Date(2024, 0, 1)); // January 1st, 2024 (month 12 wraps to next year)
  });

  it('should handle startMonth as object', () => {
    const widgetStyle: CalendarHeatmapWidgetStyle = {
      startMonth: {
        year: 2023,
        month: 0, // January (0-based)
      },
    };

    const result = extractStyleOptions(
      'heatmap',
      mockWidgetDto(widgetStyle),
    ) as CalendarHeatmapStyleOptions;

    expect(result.pagination?.startMonth).toEqual(new Date(2023, 0, 1)); // January 1st, 2023
  });

  it('should handle startMonth as string', () => {
    const widgetStyle = {
      startMonth: '2023-06-15',
    };

    const result = extractStyleOptions(
      'heatmap',
      mockWidgetDto(widgetStyle),
    ) as CalendarHeatmapStyleOptions;

    expect(result.pagination?.startMonth).toEqual(new Date('2023-06-15'));
    expect(result.pagination?.startMonth?.getFullYear()).toBe(2023);
    expect(result.pagination?.startMonth?.getMonth()).toBe(5); // June (0-based)
  });
});
