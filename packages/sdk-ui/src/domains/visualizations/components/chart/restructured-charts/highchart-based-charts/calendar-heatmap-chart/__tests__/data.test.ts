import { describe, expect, it, vi } from 'vitest';

import { CalendarHeatmapChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor.js';

import { getCalendarHeatmapChartData } from '../data.js';

// Mock the withCalendarHeatmapDataColoring function
vi.mock('../../../utils/index.js', () => ({
  withCalendarHeatmapDataColoring: vi.fn(() => (data: any) => data),
}));

describe('Calendar Heatmap Data Processing', () => {
  const mockDateColumn = { name: 'date', index: 0, type: 'date', direction: 1 };
  const mockValueColumn = { name: 'value', index: 1, type: 'number', direction: 1 };

  const mockDataOptions: CalendarHeatmapChartDataOptionsInternal = {
    date: { column: mockDateColumn },
    value: { column: mockValueColumn, color: undefined },
  };

  it('should extract blur property from data table rows for highlight filters', () => {
    const dataTable: DataTable = {
      columns: [mockDateColumn, mockValueColumn],
      rows: [
        [
          {
            displayValue: '2024-01-01',
            rawValue: '2024-01-01',
            compareValue: {
              value: new Date('2024-01-01').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: '100',
            rawValue: 100,
            compareValue: { value: 100, valueUndefined: false, valueIsNaN: false },
            blur: false,
          },
        ],
        [
          {
            displayValue: '2024-01-02',
            rawValue: '2024-01-02',
            compareValue: {
              value: new Date('2024-01-02').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: '200',
            rawValue: 200,
            compareValue: { value: 200, valueUndefined: false, valueIsNaN: false },
            blur: true,
          },
        ],
        [
          {
            displayValue: '2024-01-03',
            rawValue: '2024-01-03',
            compareValue: {
              value: new Date('2024-01-03').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: '150',
            rawValue: 150,
            compareValue: { value: 150, valueUndefined: false, valueIsNaN: false },
          }, // No blur property
        ],
        [
          {
            displayValue: '2024-01-04',
            rawValue: '2024-01-04',
            compareValue: {
              value: new Date('2024-01-04').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: '300',
            rawValue: 300,
            compareValue: { value: 300, valueUndefined: false, valueIsNaN: false },
            blur: false,
            color: '#custom-color',
          },
        ],
      ],
    };

    const result = getCalendarHeatmapChartData(mockDataOptions, dataTable);

    expect(result.type).toBe('calendar-heatmap');
    expect(result.values).toHaveLength(4);

    // Check blur property extraction
    expect(result.values[0].blur).toBe(false);
    expect(result.values[1].blur).toBe(true);
    expect(result.values[2].blur).toBeUndefined(); // No blur property in source data
    expect(result.values[3].blur).toBe(false);

    // Check other properties are preserved
    expect(result.values[0].value).toBe(100);
    expect(result.values[1].value).toBe(200);
    expect(result.values[2].value).toBe(150);
    expect(result.values[3].value).toBe(300);
    expect(result.values[3].color).toBe('#custom-color');
  });

  it('should handle invalid values with blur properties', () => {
    const dataTable: DataTable = {
      columns: [mockDateColumn, mockValueColumn],
      rows: [
        [
          {
            displayValue: '2024-01-01',
            rawValue: '2024-01-01',
            compareValue: {
              value: new Date('2024-01-01').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: 'NaN',
            rawValue: NaN,
            compareValue: { value: NaN, valueIsNaN: true, valueUndefined: false },
            blur: true,
          },
        ],
        [
          {
            displayValue: '2024-01-02',
            rawValue: '2024-01-02',
            compareValue: {
              value: new Date('2024-01-02').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: '',
            rawValue: 0,
            compareValue: { value: 0, valueUndefined: true, valueIsNaN: false },
            blur: false,
          },
        ],
      ],
    };

    const result = getCalendarHeatmapChartData(mockDataOptions, dataTable);

    expect(result.type).toBe('calendar-heatmap');
    expect(result.values).toHaveLength(2);

    // Check that invalid values are set to undefined but blur is preserved
    expect(result.values[0].value).toBeUndefined();
    expect(result.values[0].blur).toBe(true);

    expect(result.values[1].value).toBeUndefined();
    expect(result.values[1].blur).toBe(false);
  });

  it('should return empty data when required columns are missing', () => {
    const dataTable: DataTable = {
      columns: [{ name: 'other', index: 0, type: 'string', direction: 1 }],
      rows: [
        [
          {
            displayValue: 'test',
            rawValue: 'test',
            compareValue: { value: 'test', valueUndefined: false, valueIsNaN: false },
          },
        ],
      ],
    };

    const result = getCalendarHeatmapChartData(mockDataOptions, dataTable);

    expect(result.type).toBe('calendar-heatmap');
    expect(result.values).toEqual([]);
  });

  it('should handle data without blur properties', () => {
    const dataTable: DataTable = {
      columns: [mockDateColumn, mockValueColumn],
      rows: [
        [
          {
            displayValue: '2024-01-01',
            rawValue: '2024-01-01',
            compareValue: {
              value: new Date('2024-01-01').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: '100',
            rawValue: 100,
            compareValue: { value: 100, valueUndefined: false, valueIsNaN: false },
          }, // No blur property
        ],
        [
          {
            displayValue: '2024-01-02',
            rawValue: '2024-01-02',
            compareValue: {
              value: new Date('2024-01-02').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          },
          {
            displayValue: '200',
            rawValue: 200,
            compareValue: { value: 200, valueUndefined: false, valueIsNaN: false },
            color: '#data-color',
          }, // No blur, with color
        ],
      ],
    };

    const result = getCalendarHeatmapChartData(mockDataOptions, dataTable);

    expect(result.type).toBe('calendar-heatmap');
    expect(result.values).toHaveLength(2);

    // All blur properties should be undefined when not present in source data
    expect(result.values[0].blur).toBeUndefined();
    expect(result.values[1].blur).toBeUndefined();

    // Other properties should work normally
    expect(result.values[0].value).toBe(100);
    expect(result.values[1].value).toBe(200);
    expect(result.values[1].color).toBe('#data-color');
  });

  it('should handle mixed blur states with colors and weekend data', () => {
    const dataTable: DataTable = {
      columns: [mockDateColumn, mockValueColumn],
      rows: [
        [
          {
            displayValue: '2024-01-06',
            rawValue: '2024-01-06',
            compareValue: {
              value: new Date('2024-01-06').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          }, // Saturday
          {
            displayValue: '100',
            rawValue: 100,
            compareValue: { value: 100, valueUndefined: false, valueIsNaN: false },
            blur: true,
            color: '#weekend-data',
          },
        ],
        [
          {
            displayValue: '2024-01-07',
            rawValue: '2024-01-07',
            compareValue: {
              value: new Date('2024-01-07').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          }, // Sunday
          {
            displayValue: '200',
            rawValue: 200,
            compareValue: { value: 200, valueUndefined: false, valueIsNaN: false },
            blur: false,
            color: '#normal-data',
          },
        ],
        [
          {
            displayValue: '2024-01-08',
            rawValue: '2024-01-08',
            compareValue: {
              value: new Date('2024-01-08').getTime(),
              valueUndefined: false,
              valueIsNaN: false,
            },
          }, // Monday
          {
            displayValue: '150',
            rawValue: 150,
            compareValue: { value: 150, valueUndefined: false, valueIsNaN: false },
            blur: true,
          }, // No color
        ],
      ],
    };

    const result = getCalendarHeatmapChartData(mockDataOptions, dataTable);

    expect(result.type).toBe('calendar-heatmap');
    expect(result.values).toHaveLength(3);

    // Check that blur and color properties are both preserved
    expect(result.values[0].blur).toBe(true);
    expect(result.values[0].color).toBe('#weekend-data');

    expect(result.values[1].blur).toBe(false);
    expect(result.values[1].color).toBe('#normal-data');

    expect(result.values[2].blur).toBe(true);
    expect(result.values[2].color).toBeUndefined();
  });
});
