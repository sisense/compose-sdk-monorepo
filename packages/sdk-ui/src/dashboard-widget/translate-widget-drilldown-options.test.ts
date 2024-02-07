/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { CartesianChartDataOptions } from '../types';
import { DatetimeMask } from './types';
import { Panel } from './types';
import { extractDataOptions } from './translate-widget-data-options';
import { jaqlMock } from './__mocks__/jaql-mock';
import { extractDrilldownOptions } from './translate-widget-drilldown-options';
import { verifyColumn } from './translate-widget-data-options.test';

describe('translate widget drilldown options', () => {
  describe('extractDrilldownOptions', () => {
    it('should returns correct data options for cartesian chart with drilldown', () => {
      const panels: Panel[] = [
        {
          name: 'categories',
          items: [
            {
              jaql: jaqlMock.ageRange,
              parent: {
                jaql: jaqlMock.category,
                parent: {
                  format: { mask: { years: 'yyyy' } as DatetimeMask },
                  jaql: jaqlMock.date,
                },
                through: {
                  jaql: { ...jaqlMock.date, filter: { members: ['2010-01-01T00:00:00'] } },
                },
              },
              through: {
                jaql: {
                  ...jaqlMock.category,
                  filter: { members: ['Cell Phones', 'Digital Cameras'] },
                },
              },
            },
          ],
        },
        {
          name: 'values',
          items: [
            {
              jaql: jaqlMock.costAggregated,
            },
          ],
        },
      ];

      const dataOptions = extractDataOptions(
        'chart/column',
        panels,
        {},
      ) as CartesianChartDataOptions;
      const drilldownOptions = extractDrilldownOptions('chart/column', panels);

      verifyColumn(dataOptions.category[0], panels[0].items[0].parent!.parent!);
      verifyColumn(drilldownOptions?.drilldownDimensions![1]!, panels[0].items[0]);
      verifyColumn(drilldownOptions?.drilldownDimensions![0]!, panels[0].items[0].parent!);

      verifyColumn(drilldownOptions?.drilldownSelections![1].nextDimension, panels[0].items[0]);
      verifyColumn(
        drilldownOptions?.drilldownSelections![0].nextDimension,
        panels[0].items[0].parent!,
      );
      expect(drilldownOptions?.drilldownSelections![1].points).toEqual([
        { categoryValue: 'Cell Phones' },
        { categoryValue: 'Digital Cameras' },
      ]);
      expect(drilldownOptions?.drilldownSelections![0].points).toEqual([
        { categoryValue: '2010-01-01T00:00:00', categoryDisplayValue: '2010' },
      ]);
    });
  });
});
