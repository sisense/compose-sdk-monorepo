import { describe, test, expect } from 'vitest';
import { translateAreaStyleOptionsToDesignOptions, isAreaStyleOptions } from './design-options';
import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { AreaStyleOptions, AreaSubtype, ChartStyleOptions } from '@/types';

describe('Area Chart Design Options', () => {
  const mockDataOptions: CartesianChartDataOptionsInternal = {
    x: [],
    y: [],
    breakBy: [],
  };

  describe('translateAreaStyleOptionsToDesignOptions', () => {
    describe('Subtype to lineType and stackType conversion', () => {
      test('converts area/basic to straight lineType and classic stackType', () => {
        const styleOptions: AreaStyleOptions = {
          subtype: 'area/basic',
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('straight');
        expect(result.stackType).toBe('classic');
      });

      test('converts area/spline to smooth lineType and classic stackType', () => {
        const styleOptions: AreaStyleOptions = {
          subtype: 'area/spline',
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('smooth');
        expect(result.stackType).toBe('classic');
      });

      test('converts area/stacked to straight lineType and stacked stackType', () => {
        const styleOptions: AreaStyleOptions = {
          subtype: 'area/stacked',
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('straight');
        expect(result.stackType).toBe('stacked');
      });

      test('converts area/stackedspline to smooth lineType and stacked stackType', () => {
        const styleOptions: AreaStyleOptions = {
          subtype: 'area/stackedspline',
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('smooth');
        expect(result.stackType).toBe('stacked');
      });

      test('converts area/stacked100 to straight lineType and stack100 stackType', () => {
        const styleOptions: AreaStyleOptions = {
          subtype: 'area/stacked100',
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('straight');
        expect(result.stackType).toBe('stack100');
      });

      test('converts area/stackedspline100 to smooth lineType and stack100 stackType', () => {
        const styleOptions: AreaStyleOptions = {
          subtype: 'area/stackedspline100',
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('smooth');
        expect(result.stackType).toBe('stack100');
      });

      test('defaults to area/basic (straight lineType, classic stackType) when no subtype provided', () => {
        const styleOptions: AreaStyleOptions = {};

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('straight');
        expect(result.stackType).toBe('classic');
      });
    });

    describe('Line width conversion', () => {
      test('converts thin line width to 1', () => {
        const styleOptions: AreaStyleOptions = {
          lineWidth: { width: 'thin' },
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineWidth).toBe(1);
      });

      test('converts bold line width to 3', () => {
        const styleOptions: AreaStyleOptions = {
          lineWidth: { width: 'bold' },
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineWidth).toBe(3);
      });

      test('converts thick line width to 5', () => {
        const styleOptions: AreaStyleOptions = {
          lineWidth: { width: 'thick' },
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineWidth).toBe(5);
      });

      test('defaults to thin (1) when no lineWidth provided', () => {
        const styleOptions: AreaStyleOptions = {};

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineWidth).toBe(1);
      });
    });

    describe('Marker conversion', () => {
      test('converts filled markers correctly', () => {
        const styleOptions: AreaStyleOptions = {
          markers: { enabled: true, fill: 'filled', size: 'small' },
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.marker).toEqual({
          enabled: true,
          fill: 'full',
          size: 'small',
        });
      });

      test('converts hollow markers correctly', () => {
        const styleOptions: AreaStyleOptions = {
          markers: { enabled: false, fill: 'hollow', size: 'large' },
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.marker).toEqual({
          enabled: false,
          fill: 'hollow',
          size: 'large',
        });
      });

      test('uses default markers when not provided', () => {
        const styleOptions: AreaStyleOptions = {};

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.marker).toEqual({
          enabled: true,
          fill: 'full',
          size: 'small',
        });
      });
    });

    describe('Stacking options', () => {
      test('sets showTotal based on totalLabels.enabled', () => {
        const styleOptions: AreaStyleOptions = {
          totalLabels: { enabled: true, rotation: 45 },
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.showTotal).toBe(true);
        expect(result.totalLabelRotation).toBe(45);
      });

      test('defaults showTotal to false when totalLabels not provided', () => {
        const styleOptions: AreaStyleOptions = {};

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.showTotal).toBe(false);
        expect(result.totalLabelRotation).toBe(0);
      });
    });

    describe('Complete conversion scenarios', () => {
      test('converts complex spline area configuration correctly', () => {
        const styleOptions: AreaStyleOptions = {
          subtype: 'area/stackedspline100',
          lineWidth: { width: 'thick' },
          markers: { enabled: false, fill: 'hollow', size: 'large' },
          totalLabels: { enabled: true, rotation: 90 },
        };

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result.lineType).toBe('smooth');
        expect(result.stackType).toBe('stack100');
        expect(result.lineWidth).toBe(5);
        expect(result.marker).toEqual({
          enabled: false,
          fill: 'hollow',
          size: 'large',
        });
        expect(result.showTotal).toBe(true);
        expect(result.totalLabelRotation).toBe(90);
      });
    });

    describe('Design per series inclusion', () => {
      test('includes designPerSeries in result', () => {
        const styleOptions: AreaStyleOptions = {};

        const result = translateAreaStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

        expect(result).toHaveProperty('designPerSeries');
        expect(typeof result.designPerSeries).toBe('object');
      });
    });
  });

  describe('isAreaStyleOptions', () => {
    test('returns true for valid area subtypes', () => {
      const validSubtypes: AreaSubtype[] = [
        'area/basic',
        'area/spline',
        'area/stacked',
        'area/stackedspline',
        'area/stacked100',
        'area/stackedspline100',
      ];

      validSubtypes.forEach((subtype) => {
        const styleOptions: ChartStyleOptions = { subtype };
        expect(isAreaStyleOptions(styleOptions)).toBe(true);
      });
    });

    test('returns false for invalid subtypes', () => {
      const invalidSubtypes: AreaSubtype[] = [
        'line/basic',
        'column/classic',
        'bar/stacked',
        'pie/donut',
      ] as unknown as AreaSubtype[];

      invalidSubtypes.forEach((subtype) => {
        const styleOptions: ChartStyleOptions = { subtype: subtype };
        expect(isAreaStyleOptions(styleOptions)).toBe(false);
      });
    });

    test('returns true when no subtype is provided (default case)', () => {
      const styleOptions: ChartStyleOptions = {};
      expect(isAreaStyleOptions(styleOptions)).toBe(true);
    });

    test('returns true when subtype property exists but is undefined', () => {
      const styleOptions: ChartStyleOptions = { subtype: undefined };
      expect(isAreaStyleOptions(styleOptions)).toBe(true);
    });
  });
});
