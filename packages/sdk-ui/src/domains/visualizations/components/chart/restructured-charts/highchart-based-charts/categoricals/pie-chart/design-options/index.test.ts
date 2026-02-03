import { PieChartStyleOptions } from '../types.js';
import { translateStyleOptionsToDesignOptions } from './index.js';

describe('Pie Chart Design Options', () => {
  describe('translateStyleOptionsToDesignOptions', () => {
    it('should default to classic pie type when no subtype is provided', () => {
      const styleOptions: PieChartStyleOptions = {};

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.pieType).toBe('classic');
    });

    it('should set pie type to donut when subtype is pie/donut', () => {
      const styleOptions: PieChartStyleOptions = {
        subtype: 'pie/donut',
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.pieType).toBe('donut');
    });

    it('should set pie type to ring when subtype is pie/ring', () => {
      const styleOptions: PieChartStyleOptions = {
        subtype: 'pie/ring',
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.pieType).toBe('ring');
    });

    it('should set pie type to classic when subtype is pie/classic', () => {
      const styleOptions: PieChartStyleOptions = {
        subtype: 'pie/classic',
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.pieType).toBe('classic');
    });

    it('should handle labels configuration correctly', () => {
      const styleOptions: PieChartStyleOptions = {
        subtype: 'pie/donut',
        labels: {
          enabled: true,
          categories: true,
          value: true,
          percent: true,
          decimals: true,
        },
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

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

    it('should pass through semiCircle flag when enabled', () => {
      const styleOptions: PieChartStyleOptions = {
        semiCircle: true,
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.semiCircle).toBe(true);
    });

    it('should not set semiCircle when not provided', () => {
      const styleOptions: PieChartStyleOptions = {};

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.semiCircle).toBeUndefined();
    });

    it('should handle semiCircle false', () => {
      const styleOptions: PieChartStyleOptions = {
        semiCircle: false,
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.semiCircle).toBe(false);
    });
  });
});
