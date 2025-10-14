import { describe, expect, test } from 'vitest';

import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { LineStyleOptions, LineSubtype } from '@/types';

import { isLineStyleOptions, translateLineStyleOptionsToDesignOptions } from './design-options';

// Mock data options for testing
const mockDataOptions: CartesianChartDataOptionsInternal = {
  x: [{ column: { name: 'Date', type: 'date' } }],
  y: [{ column: { name: 'Revenue', aggregation: 'sum' } }],
  breakBy: [],
};

describe('translateLineStyleOptionsToDesignOptions', () => {
  describe('Line subtype to lineType conversion', () => {
    test('converts line/basic to straight lineType', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/basic',
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.lineType).toBe('straight');
    });

    test('converts line/spline to smooth lineType', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/spline',
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.lineType).toBe('smooth');
    });

    test('converts line/step to straight lineType', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/step',
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.lineType).toBe('straight');
    });

    test('defaults to line/basic (straight) when no subtype provided', () => {
      const styleOptions: LineStyleOptions = {};

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.lineType).toBe('straight');
    });
  });

  describe('Step line specific properties', () => {
    test('sets step property for line/step subtype with default position', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/step',
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.step).toBe('left');
      expect(result.lineType).toBe('straight');
    });

    test('sets step property for line/step subtype with custom position', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/step',
        stepPosition: 'center',
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.step).toBe('center');
      expect(result.lineType).toBe('straight');
    });

    test('does not set step property for non-step line types', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/spline',
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.step).toBeUndefined();
      expect(result.lineType).toBe('smooth');
    });
  });

  describe('Line width conversion', () => {
    test('converts thin line width to 1', () => {
      const styleOptions: LineStyleOptions = {
        lineWidth: { width: 'thin' },
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.line?.width).toBe(1);
    });

    test('converts bold line width to 3', () => {
      const styleOptions: LineStyleOptions = {
        lineWidth: { width: 'bold' },
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.line?.width).toBe(3);
    });

    test('converts thick line width to 5', () => {
      const styleOptions: LineStyleOptions = {
        lineWidth: { width: 'thick' },
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.line?.width).toBe(5);
    });

    test('defaults to bold (3) when no lineWidth provided', () => {
      const styleOptions: LineStyleOptions = {};

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.line?.width).toBe(3);
    });
  });

  describe('Marker conversion', () => {
    test('converts filled markers correctly', () => {
      const styleOptions: LineStyleOptions = {
        markers: {
          enabled: true,
          fill: 'filled',
          size: 'small',
        },
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.marker).toEqual({
        enabled: true,
        fill: 'full',
        size: 'small',
      });
    });

    test('converts hollow markers correctly', () => {
      const styleOptions: LineStyleOptions = {
        markers: {
          enabled: false,
          fill: 'hollow',
          size: 'large',
        },
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.marker).toEqual({
        enabled: false,
        fill: 'hollow',
        size: 'large',
      });
    });

    test('uses default markers when not provided', () => {
      const styleOptions: LineStyleOptions = {};

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.marker).toEqual({
        enabled: true,
        fill: 'full',
        size: 'small',
      });
    });
  });

  describe('Complete conversion scenarios', () => {
    test('converts complex spline line configuration correctly', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/spline',
        lineWidth: { width: 'thick' },
        markers: {
          enabled: true,
          fill: 'hollow',
          size: 'large',
        },
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result).toEqual(
        expect.objectContaining({
          lineType: 'smooth',
          line: { width: 5 },
          marker: {
            enabled: true,
            fill: 'hollow',
            size: 'large',
          },
        }),
      );
      expect(result.step).toBeUndefined();
    });

    test('converts complex step line configuration correctly', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/step',
        stepPosition: 'right',
        lineWidth: { width: 'thin' },
        markers: {
          enabled: false,
          fill: 'filled',
          size: 'small',
        },
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result).toEqual(
        expect.objectContaining({
          lineType: 'straight',
          line: { width: 1 },
          marker: {
            enabled: false,
            fill: 'full',
            size: 'small',
          },
          step: 'right',
        }),
      );
    });
  });

  describe('Design per series inclusion', () => {
    test('includes designPerSeries in result', () => {
      const styleOptions: LineStyleOptions = {
        subtype: 'line/basic',
      };

      const result = translateLineStyleOptionsToDesignOptions(styleOptions, mockDataOptions);

      expect(result.designPerSeries).toBeDefined();
      expect(typeof result.designPerSeries).toBe('object');
    });
  });
});

describe('isLineStyleOptions', () => {
  test('returns true for valid line subtypes', () => {
    const validSubtypes: LineSubtype[] = ['line/basic', 'line/spline', 'line/step'];

    validSubtypes.forEach((subtype) => {
      const styleOptions = { subtype };
      expect(isLineStyleOptions(styleOptions)).toBe(true);
    });
  });

  test('returns false for invalid subtypes', () => {
    const invalidStyleOptions = [
      { subtype: 'column/classic' as any },
      { subtype: 'area/basic' as any },
      { subtype: 'pie/classic' as any },
      { subtype: 'invalid/type' as any },
    ];

    invalidStyleOptions.forEach((styleOptions) => {
      expect(isLineStyleOptions(styleOptions as any)).toBe(false);
    });
  });

  test('returns true when no subtype is provided (default case)', () => {
    const styleOptions = {};
    expect(isLineStyleOptions(styleOptions)).toBe(true);
  });

  test('returns true when subtype property exists but is undefined', () => {
    const styleOptions = { subtype: undefined };
    expect(isLineStyleOptions(styleOptions)).toBe(true);
  });
});
