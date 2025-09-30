import { CompleteThemeSettings, RangeDataColorOptions, UniformDataColorOptions } from '@/types';
import { CalendarHeatmapChartData } from '../data';
import {
  withCalendarHeatmapDataColoring,
  getCalendarHeatmapDefaultColorOptions,
} from './with-calendar-heatmap-data-coloring';

describe('getCalendarHeatmapDefaultColorOptions', () => {
  const mockThemeSettings: CompleteThemeSettings = {
    palette: {
      variantColors: ['#ff0000', '#00ff00', '#0000ff'],
    },
  } as CompleteThemeSettings;

  it('should return range color options with correct structure', () => {
    const result = getCalendarHeatmapDefaultColorOptions(mockThemeSettings);

    expect(result.type).toBe('range');
    expect(result.minColor).toBeDefined();
    expect(result.maxColor).toBeDefined();
    expect(typeof result.minColor).toBe('string');
    expect(typeof result.maxColor).toBe('string');
  });
});

describe('withCalendarHeatmapDataColoring', () => {
  const mockChartData: CalendarHeatmapChartData = {
    type: 'calendar-heatmap',
    values: [
      {
        date: new Date('2023-01-01'),
        value: 10,
      },
      {
        date: new Date('2023-01-02'),
        value: 20,
        color: '#existing-color',
      },
      {
        date: new Date('2023-01-03'),
        value: 30,
      },
    ],
  };

  it('should return identity function when no color options provided', () => {
    const coloringFunction = withCalendarHeatmapDataColoring();
    const result = coloringFunction(mockChartData);

    expect(result).toBe(mockChartData);
  });

  it('should return identity function when color options is undefined', () => {
    const coloringFunction = withCalendarHeatmapDataColoring(undefined);
    const result = coloringFunction(mockChartData);

    expect(result).toBe(mockChartData);
  });

  it('should apply range coloring to data values', () => {
    const rangeColorOptions: RangeDataColorOptions = {
      type: 'range',
      minColor: '#ff0000',
      maxColor: '#0000ff',
    };

    const coloringFunction = withCalendarHeatmapDataColoring(rangeColorOptions);
    const result = coloringFunction(mockChartData);

    expect(result.type).toBe('calendar-heatmap');
    expect(result.values).toHaveLength(3);

    // First value should get a color (not existing color)
    expect(result.values[0].color).toBeDefined();
    expect(result.values[0].date).toEqual(new Date('2023-01-01'));
    expect(result.values[0].value).toBe(10);

    // Second value should preserve existing color
    expect(result.values[1].color).toBe('#existing-color');
    expect(result.values[1].date).toEqual(new Date('2023-01-02'));
    expect(result.values[1].value).toBe(20);

    // Third value should get a color (not existing color)
    expect(result.values[2].color).toBeDefined();
    expect(result.values[2].date).toEqual(new Date('2023-01-03'));
    expect(result.values[2].value).toBe(30);
  });

  it('should apply uniform coloring to data values', () => {
    const uniformColorOptions: UniformDataColorOptions = {
      type: 'uniform',
      color: '#00ff00',
    };

    const coloringFunction = withCalendarHeatmapDataColoring(uniformColorOptions);
    const result = coloringFunction(mockChartData);

    expect(result.type).toBe('calendar-heatmap');
    expect(result.values).toHaveLength(3);

    // First value should get uniform color
    expect(result.values[0].color).toBe('#00ff00');
    expect(result.values[0].date).toEqual(new Date('2023-01-01'));
    expect(result.values[0].value).toBe(10);

    // Second value should preserve existing color
    expect(result.values[1].color).toBe('#existing-color');
    expect(result.values[1].date).toEqual(new Date('2023-01-02'));
    expect(result.values[1].value).toBe(20);

    // Third value should get uniform color
    expect(result.values[2].color).toBe('#00ff00');
    expect(result.values[2].date).toEqual(new Date('2023-01-03'));
    expect(result.values[2].value).toBe(30);
  });

  it('should preserve existing data structure properties', () => {
    const dataWithExtraProps: CalendarHeatmapChartData = {
      type: 'calendar-heatmap',
      values: [
        {
          date: new Date('2023-01-01'),
          value: 10,
          blur: true,
        },
      ],
    };

    const colorOptions: RangeDataColorOptions = {
      type: 'range',
      minColor: '#ff0000',
      maxColor: '#0000ff',
    };

    const coloringFunction = withCalendarHeatmapDataColoring(colorOptions);
    const result = coloringFunction(dataWithExtraProps);

    expect(result.values[0].date).toEqual(new Date('2023-01-01'));
    expect(result.values[0].value).toBe(10);
    expect(result.values[0].blur).toBe(true);
    expect(result.values[0].color).toBeDefined();
    expect(typeof result.values[0].color).toBe('string');
  });

  it('should not override existing colors from data table', () => {
    const dataWithExistingColors: CalendarHeatmapChartData = {
      type: 'calendar-heatmap',
      values: [
        {
          date: new Date('2023-01-01'),
          value: 10,
          color: '#data-table-color',
        },
      ],
    };

    const colorOptions: UniformDataColorOptions = {
      type: 'uniform',
      color: '#generated-color',
    };

    const coloringFunction = withCalendarHeatmapDataColoring(colorOptions);
    const result = coloringFunction(dataWithExistingColors);

    expect(result.values[0].color).toBe('#data-table-color');
  });
});
