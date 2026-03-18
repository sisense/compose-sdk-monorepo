import { createAttribute } from '@sisense/sdk-data';

import { CartesianChartDataOptions, ScatterChartDataOptions } from '@/types.js';

import {
  applyDrilldownDimension,
  getDrilldownInitialDimension,
  isDrilldownApplicableToChart,
} from './drilldown-utils.js';

/** Measure column (has aggregation) so isMeasureColumn returns true. */
const revenueMeasure = {
  name: 'Total Revenue',
  aggregation: 'sum' as const,
  expression: '[Commerce.Revenue]',
};

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

describe('drilldown-utils', () => {
  describe('isDrilldownApplicableToChart', () => {
    it('should allow drilldown for cartesian chart with single category', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange],
        value: [],
        breakBy: [],
      };

      const result = isDrilldownApplicableToChart('column', dataOptions);

      expect(result).toBe(true);
    });

    it('should allow drilldown for cartesian chart with multiple categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange, gender, category],
        value: [],
        breakBy: [],
      };

      const result = isDrilldownApplicableToChart('column', dataOptions);

      // Should now return true with the fix (previously returned false)
      expect(result).toBe(true);
    });

    it('should not allow drilldown for cartesian chart with no categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [],
        value: [],
        breakBy: [],
      };

      const result = isDrilldownApplicableToChart('column', dataOptions);

      expect(result).toBe(false);
    });

    it('should allow drilldown for line chart with multiple categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange, gender],
        value: [],
        breakBy: [],
      };

      const result = isDrilldownApplicableToChart('line', dataOptions);

      expect(result).toBe(true);
    });

    it('should allow drilldown for scatter chart with multiple attributes', () => {
      const dataOptions: ScatterChartDataOptions = {
        x: ageRange,
        y: revenue,
        breakByPoint: gender,
        breakByColor: category,
        size: undefined,
      };

      const result = isDrilldownApplicableToChart('scatter', dataOptions);

      // Should now return true with the fix
      expect(result).toBe(true);
    });

    it('should allow drilldown for bar chart with multiple categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange, gender, category],
        value: [],
        breakBy: [],
      };

      const result = isDrilldownApplicableToChart('bar', dataOptions);

      expect(result).toBe(true);
    });

    it('should allow drilldown for area chart with multiple categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange, gender],
        value: [],
        breakBy: [],
      };

      const result = isDrilldownApplicableToChart('area', dataOptions);

      expect(result).toBe(true);
    });

    it('should allow drilldown for pie chart with multiple categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange, gender],
        value: [],
        breakBy: [],
      };

      const result = isDrilldownApplicableToChart('pie', dataOptions);

      expect(result).toBe(true);
    });

    it('should not allow drilldown for unsupported chart types', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange],
        value: [],
        breakBy: [],
      };

      // 'table' is not a supported chart type for drilldown
      const result = isDrilldownApplicableToChart('table' as any, dataOptions);

      expect(result).toBe(false);
    });
  });

  describe('getDrilldownInitialDimension', () => {
    it('should return the first category for cartesian chart with single category', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange],
        value: [],
        breakBy: [],
      };

      const result = getDrilldownInitialDimension('column', dataOptions);

      expect(result).toBeDefined();
      expect(result?.expression).toBe(ageRange.expression);
    });

    it('should return the first category for cartesian chart with multiple categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange, gender, category],
        value: [],
        breakBy: [],
      };

      const result = getDrilldownInitialDimension('column', dataOptions);

      // Should return the first category (ageRange)
      expect(result).toBeDefined();
      expect(result?.expression).toBe(ageRange.expression);
    });

    it('should return the first non-measure attribute for scatter chart', () => {
      const dataOptions: ScatterChartDataOptions = {
        x: ageRange,
        y: revenue,
        breakByPoint: gender,
        breakByColor: category,
        size: undefined,
      };

      const result = getDrilldownInitialDimension('scatter', dataOptions);

      // Should return the first selectable attribute
      expect(result).toBeDefined();
      expect(result?.expression).toBe(ageRange.expression);
    });

    it('should return undefined when no categories exist', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [],
        value: [],
        breakBy: [],
      };

      const result = getDrilldownInitialDimension('column', dataOptions);

      expect(result).toBeUndefined();
    });

    it('should return the first category when two categories are present', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [gender, category],
        value: [],
        breakBy: [],
      };

      const result = getDrilldownInitialDimension('bar', dataOptions);

      expect(result).toBeDefined();
      expect(result?.expression).toBe(gender.expression);
    });
  });

  describe('applyDrilldownDimension', () => {
    it('should replace category with drilldown dimension for column chart when different', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange],
        value: [],
        breakBy: [],
      };

      const result = applyDrilldownDimension('column', dataOptions, gender);

      expect(result).not.toBe(dataOptions);
      expect((result as CartesianChartDataOptions).category).toEqual([gender]);
    });

    it('should return unchanged dataOptions for column chart when category equals drilldown dimension', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange],
        value: [],
        breakBy: [],
      };

      const result = applyDrilldownDimension('column', dataOptions, ageRange);

      expect(result).toBe(dataOptions);
    });

    it('should replace first category for bar chart with multiple categories', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange, gender, category],
        value: [],
        breakBy: [],
      };

      const result = applyDrilldownDimension('bar', dataOptions, category);

      expect((result as CartesianChartDataOptions).category).toEqual([category]);
    });

    it('should replace category for line chart', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [gender],
        value: [],
        breakBy: [],
      };

      const result = applyDrilldownDimension('line', dataOptions, ageRange);

      expect((result as CartesianChartDataOptions).category).toEqual([ageRange]);
    });

    it('should replace category for pie chart', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange],
        value: [],
        breakBy: [],
      };

      const result = applyDrilldownDimension('pie', dataOptions, gender);

      expect((result as CartesianChartDataOptions).category).toEqual([gender]);
    });

    it('should replace x with drilldown dimension for scatter when x is category attribute', () => {
      const dataOptions: ScatterChartDataOptions = {
        x: ageRange,
        y: revenue,
        breakByPoint: undefined,
        breakByColor: undefined,
        size: undefined,
      };

      const result = applyDrilldownDimension('scatter', dataOptions, gender);

      expect(result).not.toBe(dataOptions);
      expect((result as ScatterChartDataOptions).x).toEqual(gender);
      expect((result as ScatterChartDataOptions).y).toBe(revenue);
    });

    it('should replace y with drilldown dimension for scatter when x is measure and y is category', () => {
      const dataOptions: ScatterChartDataOptions = {
        x: revenueMeasure,
        y: ageRange,
        breakByPoint: undefined,
        breakByColor: undefined,
        size: undefined,
      };

      const result = applyDrilldownDimension('scatter', dataOptions, gender);

      expect((result as ScatterChartDataOptions).x).toBe(revenueMeasure);
      expect((result as ScatterChartDataOptions).y).toEqual(gender);
    });

    it('should replace first non-measure slot (breakByPoint) for scatter when x and y are measures', () => {
      const dataOptions: ScatterChartDataOptions = {
        x: revenueMeasure,
        y: revenueMeasure,
        breakByPoint: ageRange,
        breakByColor: undefined,
        size: undefined,
      };

      const result = applyDrilldownDimension('scatter', dataOptions, gender);

      expect((result as ScatterChartDataOptions).breakByPoint).toEqual(gender);
    });

    it('should return unchanged scatter dataOptions when first non-measure already equals drilldown dimension', () => {
      const dataOptions: ScatterChartDataOptions = {
        x: ageRange,
        y: revenue,
        breakByPoint: undefined,
        breakByColor: undefined,
        size: undefined,
      };

      const result = applyDrilldownDimension('scatter', dataOptions, ageRange);

      expect(result).toBe(dataOptions);
    });

    it('should return unchanged dataOptions for unsupported chart type', () => {
      const dataOptions: CartesianChartDataOptions = {
        category: [ageRange],
        value: [],
        breakBy: [],
      };

      const result = applyDrilldownDimension('table' as 'column', dataOptions, gender);

      expect(result).toBe(dataOptions);
    });
  });
});
