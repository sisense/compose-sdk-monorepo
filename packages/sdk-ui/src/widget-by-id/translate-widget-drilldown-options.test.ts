/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { Attribute } from '@sisense/sdk-data';

import { Hierarchy } from '@/models';

import { CartesianChartDataOptions } from '../types.js';
import { jaqlMock } from './__mocks__/jaql-mock.js';
import { extractDataOptions } from './translate-widget-data-options.js';
import { verifyColumn } from './translate-widget-data-options.test.js';
import { extractDrilldownOptions } from './translate-widget-drilldown-options.js';
import { DatetimeMask } from './types.js';
import { Panel } from './types.js';

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

    it('should allow drilldown when multiple drillable items exist and use the first one', () => {
      // Create a scenario with two drillable items in the categories panel
      const panels: Panel[] = [
        {
          name: 'categories',
          items: [
            {
              jaql: jaqlMock.ageRange,
              parent: {
                jaql: jaqlMock.category,
              },
              through: {
                jaql: {
                  ...jaqlMock.category,
                  filter: { members: ['Cell Phones', 'Digital Cameras'] },
                },
              },
            },
            {
              jaql: jaqlMock.date,
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

      const drilldownOptions = extractDrilldownOptions('chart/column', panels);

      // Should extract drilldown options using the first drillable item (ageRange)
      // Previously this would have returned no drilldown options because multiple items exist
      expect(drilldownOptions).toBeDefined();
      expect(drilldownOptions?.drilldownPaths).toBeDefined();
      expect(drilldownOptions?.drilldownPaths!.length).toBeGreaterThan(0);

      // Verify that drilldown paths include attributes from the first drillable item
      // The fix allows drilldown even when multiple drillable items exist
      expect(drilldownOptions?.drilldownPaths!.length).toBeGreaterThanOrEqual(1);

      // Check that at least one of the expected attributes is in the drilldown paths
      const expressions = drilldownOptions?.drilldownPaths!.map((p) => (p as Attribute).expression);
      const hasExpectedAttribute =
        expressions.includes('[Commerce.Category]') || expressions.includes('[Commerce.Age Range]');
      expect(hasExpectedAttribute).toBe(true);
    });

    it('should allow drilldown when multiple drillable items exist with measures mixed in', () => {
      // Create a scenario where measures are mixed with drillable attributes
      const panels: Panel[] = [
        {
          name: 'categories',
          items: [
            {
              jaql: jaqlMock.ageRange,
              parent: {
                jaql: jaqlMock.category,
              },
              through: {
                jaql: {
                  ...jaqlMock.category,
                  filter: { members: ['Cell Phones', 'Digital Cameras'] },
                },
              },
            },
            {
              jaql: jaqlMock.costAggregated, // This is a measure, should be filtered out
            },
            {
              jaql: jaqlMock.date,
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

      const drilldownOptions = extractDrilldownOptions('chart/column', panels);

      // Should extract drilldown options using the first drillable (non-measure) item
      expect(drilldownOptions).toBeDefined();
      expect(drilldownOptions?.drilldownPaths).toBeDefined();
      expect(drilldownOptions?.drilldownPaths!.length).toBeGreaterThan(0);

      // Verify that drilldown paths include attributes from the first non-measure drillable item
      expect(drilldownOptions?.drilldownPaths!.length).toBeGreaterThanOrEqual(1);

      // Check that at least one of the expected attributes is in the drilldown paths
      const expressions = drilldownOptions?.drilldownPaths!.map((p) => (p as Attribute).expression);
      const hasExpectedAttribute =
        expressions.includes('[Commerce.Category]') || expressions.includes('[Commerce.Age Range]');
      expect(hasExpectedAttribute).toBe(true);
    });

    it('should allow drilldown when multiple drillable items exist with formulas mixed in', () => {
      // Create a scenario where formulas are mixed with drillable attributes
      const panels: Panel[] = [
        {
          name: 'categories',
          items: [
            {
              jaql: jaqlMock.ageRange,
              parent: {
                jaql: jaqlMock.category,
              },
              through: {
                jaql: {
                  ...jaqlMock.category,
                  filter: { members: ['Cell Phones', 'Digital Cameras'] },
                },
              },
            },
            {
              jaql: jaqlMock.formula, // This is a formula, should be filtered out
            },
            {
              jaql: jaqlMock.date,
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

      const drilldownOptions = extractDrilldownOptions('chart/column', panels);

      // Should extract drilldown options using the first drillable (non-formula) item
      expect(drilldownOptions).toBeDefined();
      expect(drilldownOptions?.drilldownPaths).toBeDefined();
      expect(drilldownOptions?.drilldownPaths!.length).toBeGreaterThan(0);

      // Verify that drilldown paths include attributes from the first non-formula drillable item
      expect(drilldownOptions?.drilldownPaths!.length).toBeGreaterThanOrEqual(1);

      // Check that at least one of the expected attributes is in the drilldown paths
      const expressions = drilldownOptions?.drilldownPaths!.map((p) => (p as Attribute).expression);
      const hasExpectedAttribute =
        expressions.includes('[Commerce.Category]') || expressions.includes('[Commerce.Age Range]');
      expect(hasExpectedAttribute).toBe(true);
    });
  });
});
