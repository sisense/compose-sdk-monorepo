import { createAttribute } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';

import { MenuProvider } from '@/common/components/menu/menu-provider.js';
import { CartesianChartDataOptions, ChartWidgetProps } from '@/index.js';

import { useWithDrilldown } from './use-with-drilldown.js';

vi.mock('./use-synced-hierarchies.js', async () => ({
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

const openMenuMock = vi.fn();

describe('useWithDrilldown', () => {
  beforeEach(() => {
    openMenuMock.mockClear();
  });

  it('should extend ChartWidget props with drilldown', () => {
    const { result } = renderHook(
      () =>
        useWithDrilldown({
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
});
