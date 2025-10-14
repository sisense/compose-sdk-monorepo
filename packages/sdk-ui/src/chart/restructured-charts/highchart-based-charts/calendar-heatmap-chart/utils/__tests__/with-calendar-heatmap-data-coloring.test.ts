import { describe, expect, it } from 'vitest';

import { DataColorOptions } from '@/types.js';

import { CalendarHeatmapDataValue } from '../../data.js';
import { withCalendarHeatmapDataColoring } from '../with-calendar-heatmap-data-coloring.js';

describe('withCalendarHeatmapDataColoring', () => {
  const mockDataValues: CalendarHeatmapDataValue[] = [
    {
      date: new Date('2024-01-01'),
      value: 10,
    },
    {
      date: new Date('2024-01-02'),
      value: 20,
      color: '#existing-color', // Already has a color from data table
    },
    {
      date: new Date('2024-01-03'),
      value: 30,
    },
    {
      date: new Date('2024-01-04'),
      value: 40, // No value
    },
  ];

  const mockChartData = {
    type: 'calendar-heatmap' as const,
    values: mockDataValues,
  };

  it('should return identity function when no color options provided', () => {
    const decorator = withCalendarHeatmapDataColoring(undefined);
    const result = decorator(mockChartData);

    expect(result).toEqual(mockChartData);
    expect(result).toBe(mockChartData); // Should return the same reference
  });

  it('should apply uniform coloring while preserving existing colors', () => {
    const colorOptions: DataColorOptions = {
      type: 'uniform',
      color: '#ff0000',
    };

    const decorator = withCalendarHeatmapDataColoring(colorOptions);
    const result = decorator(mockChartData);

    expect(result.values).toHaveLength(4);

    // Should apply color to values without existing colors
    expect(result.values[0].color).toBe('#ff0000');
    expect(result.values[2].color).toBe('#ff0000');
    expect(result.values[3].color).toBe('#ff0000');

    // Should preserve existing colors (data table colors take priority)
    expect(result.values[1].color).toBe('#existing-color');
  });

  it('should apply range coloring to values without existing colors', () => {
    const colorOptions: DataColorOptions = {
      type: 'range',
      steps: 3,
    };

    const decorator = withCalendarHeatmapDataColoring(colorOptions);
    const result = decorator(mockChartData);

    expect(result.values).toHaveLength(4);

    // Should apply colors to values without existing colors
    expect(result.values[0].color).toBeDefined();
    expect(result.values[2].color).toBeDefined();
    expect(result.values[3].color).toBeDefined();

    // Should preserve existing colors
    expect(result.values[1].color).toBe('#existing-color');
  });

  it('should return new array even when all values have colors', () => {
    const dataWithAllColors: CalendarHeatmapDataValue[] = [
      {
        date: new Date('2024-01-01'),
        value: 10,
        color: '#existing-1',
      },
      {
        date: new Date('2024-01-02'),
        value: 20,
        color: '#existing-2',
      },
      {
        date: new Date('2024-01-03'),
        value: 30,
        color: '#existing-3',
      },
    ];

    const colorOptions: DataColorOptions = {
      type: 'uniform',
      color: '#ff0000',
    };

    const chartDataWithAllColors = {
      type: 'calendar-heatmap' as const,
      values: dataWithAllColors,
    };

    const decorator = withCalendarHeatmapDataColoring(colorOptions);
    const result = decorator(chartDataWithAllColors);

    // Should preserve all existing colors (data table colors take priority)
    expect(result.values[0].color).toBe('#existing-1');
    expect(result.values[1].color).toBe('#existing-2');
    expect(result.values[2].color).toBe('#existing-3');

    // Should return a new object, not the same reference
    expect(result).not.toBe(chartDataWithAllColors);
    expect(result.values).toEqual(dataWithAllColors);
  });

  it('should handle empty data array', () => {
    const colorOptions: DataColorOptions = {
      type: 'uniform',
      color: '#ff0000',
    };

    const emptyChartData = {
      type: 'calendar-heatmap' as const,
      values: [],
    };

    const decorator = withCalendarHeatmapDataColoring(colorOptions);
    const result = decorator(emptyChartData);

    expect(result.values).toEqual([]);
  });

  it('should handle data with mixed values correctly', () => {
    const mixedData: CalendarHeatmapDataValue[] = [
      {
        date: new Date('2024-01-01'),
        value: 0, // Zero value should get colored
      },
      {
        date: new Date('2024-01-02'),
        value: null as any, // Null value should get colored (treated as 0)
      },
      {
        date: new Date('2024-01-03'),
        value: 100,
        color: '#existing-color', // Should preserve existing color
      },
    ];

    const colorOptions: DataColorOptions = {
      type: 'uniform',
      color: '#blue',
    };

    const mixedChartData = {
      type: 'calendar-heatmap' as const,
      values: mixedData,
    };

    const decorator = withCalendarHeatmapDataColoring(colorOptions);
    const result = decorator(mixedChartData);

    // Zero and null values should get colored
    expect(result.values[0].color).toBe('#blue');
    expect(result.values[1].color).toBe('#blue');

    // Existing color should be preserved
    expect(result.values[2].color).toBe('#existing-color');
  });
});
