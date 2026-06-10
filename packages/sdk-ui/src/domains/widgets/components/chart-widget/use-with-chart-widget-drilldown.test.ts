import { attributeFactory, createAttribute } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';

import { CartesianChartDataOptions } from '@/index.js';
import { MenuProvider } from '@/infra/contexts/menu-provider/menu-provider';

import { ChartWidgetProps } from './types';
import { useWithChartWidgetDrilldown } from './use-with-chart-widget-drilldown.js';

vi.mock('../../../drilldown/hooks/use-synced-drilldown-paths.js', async () => ({
  useSyncedDrilldownPaths: (params: any) => params.drilldownPaths,
}));

const ageRange = createAttribute({
  name: 'Age Range',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});

const gender = createAttribute({
  name: 'Gender',
  type: 'text-attribute',
  expression: '[Commerce.Gender]',
});

const category = createAttribute({
  name: 'Category',
  type: 'text-attribute',
  expression: '[Commerce.Category]',
});

const revenue = createAttribute({
  name: 'Revenue',
  type: 'numeric-attribute',
  expression: '[Commerce.Revenue]',
});

const openMenuMock = vi.fn();

describe('useWithDrilldown', () => {
  beforeEach(() => {
    openMenuMock.mockClear();
  });

  it('should extend ChartWidget props with drilldown', () => {
    const { result } = renderHook(
      () =>
        useWithChartWidgetDrilldown({
          propsToExtend: {
            chartType: 'column',
            dataOptions: {
              category: [gender],
              value: [],
            },
            drilldownOptions: {
              drilldownSelections: [
                {
                  points: [
                    {
                      categoryValue: 'Male',
                    },
                  ],
                  nextDimension: category,
                },
              ],
              drilldownPaths: [ageRange],
            },
          } as ChartWidgetProps,
        }),
      {
        wrapper: MenuProvider,
      },
    );

    const { propsWithDrilldown, isDrilldownEnabled, breadcrumbs } = result.current;

    expect(propsWithDrilldown.onDataPointContextMenu).toBeInstanceOf(Function);
    expect(propsWithDrilldown.onDataPointsSelected).toBeInstanceOf(Function);
    expect((propsWithDrilldown.dataOptions as CartesianChartDataOptions).category[0]).toStrictEqual(
      category,
    );
    expect(propsWithDrilldown.filters).toMatchObject([{ attribute: gender, members: ['Male'] }]);
    expect(breadcrumbs).toBeDefined();
    expect(isDrilldownEnabled).toBe(true);
  });

  it('keeps original data options (no dummy attribute) and disables drilldown for a calculated dimension', () => {
    const calcDim = attributeFactory.customFormula('Bucket', "IF([rev] > 1000, 'A', 'B')", {
      rev: revenue,
    });

    const { result } = renderHook(
      () =>
        useWithChartWidgetDrilldown({
          propsToExtend: {
            chartType: 'column',
            dataOptions: {
              category: [calcDim],
              value: [],
            },
            drilldownOptions: {
              drilldownPaths: [ageRange],
            },
          } as ChartWidgetProps,
        }),
      {
        wrapper: MenuProvider,
      },
    );

    const { propsWithDrilldown, isDrilldownEnabled } = result.current;

    // The calculated dimension must be preserved as-is — the dim-less dummy drilldown
    // attribute must NOT replace it (which previously produced an invalid "no dim" query).
    expect((propsWithDrilldown.dataOptions as CartesianChartDataOptions).category[0]).toStrictEqual(
      calcDim,
    );
    expect(isDrilldownEnabled).toBe(false);
  });
});
