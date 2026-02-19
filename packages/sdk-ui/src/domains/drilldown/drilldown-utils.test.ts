import { createAttribute } from '@sisense/sdk-data';

import { CartesianChartDataOptions, ScatterChartDataOptions } from '@/types.js';

import { getDrilldownInitialDimension, isDrilldownApplicableToChart } from './drilldown-utils.js';

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
});
