/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { CartesianChartDataOptions } from '../types.js';
import { DatetimeMask } from './types.js';
import { Panel } from './types.js';
import { extractDataOptions } from './translate-widget-data-options.js';
import { jaqlMock } from './__mocks__/jaql-mock.js';
import { extractDrilldownOptions } from './translate-widget-drilldown-options.js';
import { verifyColumn } from './translate-widget-data-options.test.js';
import { Attribute } from '@ethings-os/sdk-data';
import { Hierarchy } from '@/models';

describe('translate widget drilldown options', () => {
  describe('extractDrilldownOptions', () => {
    it('should return correct data options for cartesian chart with drilldown', () => {
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
                  hierarchies: ['calendar', 'calendar - weeks', '12345'],
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
      verifyColumn(drilldownOptions?.drilldownPaths![1] as Attribute, panels[0].items[0]);
      verifyColumn(drilldownOptions?.drilldownPaths![0] as Attribute, panels[0].items[0].parent!);

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
      expect((drilldownOptions?.drilldownPaths?.[2] as Hierarchy).title).toBe('Calendar Hierarchy');
      expect(drilldownOptions?.drilldownPaths?.[3]).toBe('12345');
    });
  });
});
