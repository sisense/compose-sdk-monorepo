/** @vitest-environment jsdom */
import { DateLevels } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { CartesianChartDataOptionsInternal } from '../chart-data-options/types';
import { CartesianChartData } from '../chart-data/types';
import { getCategoriesIndexMapAndPlotBands } from './plot-bands';
import { DesignOptions } from './translations/types';

const designOptions = {
  dataLimits: { seriesCapacity: 100, categoriesCapacity: 100 },
} as DesignOptions;

describe('getCategoriesIndexMapAndPlotBands', () => {
  it('formats datetime x1 and x2 labels from raw values when dateFormatter is provided', () => {
    const data: CartesianChartData = {
      type: 'cartesian',
      xAxisCount: 2,
      xValues: [
        {
          key: 'a',
          xValues: ['W1', '08/01/2011'],
          rawValues: ['2011-08-01T00:00:00.000Z', '2011-08-01T00:00:00.000Z'],
        },
        {
          key: 'b',
          xValues: ['W2', '08/02/2011'],
          rawValues: ['2011-08-08T00:00:00.000Z', '2011-08-02T00:00:00.000Z'],
        },
      ],
      series: [],
    };

    const dataOptions: CartesianChartDataOptionsInternal = {
      x: [
        {
          column: { name: 'week', type: 'datetime' },
          granularity: DateLevels.Weeks,
          dateFormat: 'yyyy',
        },
        {
          column: { name: 'day', type: 'datetime' },
          granularity: DateLevels.Days,
          dateFormat: 'dd.MM.yy',
        },
      ],
      y: [],
      breakBy: [],
    };

    const dateFormatter = (d: Date) => `T:${d.toISOString().slice(0, 10)}`;

    const result = getCategoriesIndexMapAndPlotBands(
      data,
      dataOptions,
      designOptions,
      false,
      dateFormatter,
    );

    expect(result.categories[0]).toBe('T:2011-08-01');
    expect(result.categories[1]).toBe(' ');
    expect(result.categories[2]).toBe('T:2011-08-02');

    expect(result.plotBands[0].text).toBe('T:2011-08-01');
    expect(result.plotBands[1].text).toBe('T:2011-08-08');
  });
});
