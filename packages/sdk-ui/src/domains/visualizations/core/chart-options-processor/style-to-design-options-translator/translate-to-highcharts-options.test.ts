import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { LineStyleOptions, PieStyleOptions } from '@/types';

import {
  getLineChartDesignOptions,
  getPieChartDesignOptions,
} from './translate-to-highcharts-options.js';

const emptyDataOptions: CartesianChartDataOptionsInternal = {
  x: [],
  y: [],
  breakBy: [],
};

describe('Legacy Pie Chart Design Options', () => {
  describe('getPieChartDesignOptions', () => {
    it('should default to classic pie type when no subtype is provided', () => {
      const styleOptions: PieStyleOptions = {};

      const result = getPieChartDesignOptions(styleOptions);

      expect(result.pieType).toBe('classic');
    });

    it('should set pie type to donut when subtype is pie/donut', () => {
      const styleOptions: PieStyleOptions = {
        subtype: 'pie/donut',
      };

      const result = getPieChartDesignOptions(styleOptions);

      expect(result.pieType).toBe('donut');
    });

    it('should set pie type to ring when subtype is pie/ring', () => {
      const styleOptions: PieStyleOptions = {
        subtype: 'pie/ring',
      };

      const result = getPieChartDesignOptions(styleOptions);

      expect(result.pieType).toBe('ring');
    });

    it('should set pie type to classic when subtype is pie/classic', () => {
      const styleOptions: PieStyleOptions = {
        subtype: 'pie/classic',
      };

      const result = getPieChartDesignOptions(styleOptions);

      expect(result.pieType).toBe('classic');
    });

    it('handles labels configuration correctly with donut subtype', () => {
      const styleOptions: PieStyleOptions = {
        subtype: 'pie/donut',
        labels: {
          enabled: true,
          categories: true,
          value: true,
          percent: true,
          decimals: true,
        },
      };

      const result = getPieChartDesignOptions(styleOptions);

      expect(result.seriesLabels).toEqual({
        enabled: true,
        showCategory: true,
        showValue: true,
        percentageLabels: {
          enabled: true,
          showDecimals: true,
        },
      });
      expect(result.pieType).toBe('donut');
    });
  });
});

describe('getNavigator passthrough via getLineChartDesignOptions', () => {
  it('propagates onScrollerChange when navigator is enabled', () => {
    const onScrollerChange = vi.fn();
    const styleOptions: LineStyleOptions = {
      navigator: { enabled: true, onScrollerChange },
    };

    const result = getLineChartDesignOptions(styleOptions, emptyDataOptions, false);

    expect(result.autoZoom.onScrollerChange).toBe(onScrollerChange);
    expect(result.autoZoom.enabled).toBe(true);
  });

  it('preserves scrollerLocation alongside onScrollerChange', () => {
    const onScrollerChange = vi.fn();
    const scrollerLocation = { min: 10, max: 90 };
    const styleOptions: LineStyleOptions = {
      navigator: { enabled: true, onScrollerChange, scrollerLocation },
    };

    const result = getLineChartDesignOptions(styleOptions, emptyDataOptions, false);

    expect(result.autoZoom.onScrollerChange).toBe(onScrollerChange);
    expect(result.autoZoom.scrollerLocation).toEqual(scrollerLocation);
  });

  it('produces disabled autoZoom when navigator is not provided', () => {
    const result = getLineChartDesignOptions({}, emptyDataOptions, false);

    expect(result.autoZoom.enabled).toBe(false);
    expect(result.autoZoom.onScrollerChange).toBeUndefined();
  });

  it('produces disabled autoZoom when navigator is explicitly disabled', () => {
    const onScrollerChange = vi.fn();
    const styleOptions: LineStyleOptions = {
      navigator: { enabled: false, onScrollerChange },
    };

    const result = getLineChartDesignOptions(styleOptions, emptyDataOptions, false);

    expect(result.autoZoom.enabled).toBe(false);
    expect(result.autoZoom.onScrollerChange).toBeUndefined();
  });
});
