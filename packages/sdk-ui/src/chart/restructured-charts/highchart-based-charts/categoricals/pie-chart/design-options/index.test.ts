import { PieChartStyleOptions } from '../types';
import { translateStyleOptionsToDesignOptions } from './index';

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

      expect(result.pieLabels).toEqual({
        enabled: true,
        showCategories: true,
        showValue: true,
        showPercent: true,
        showDecimals: true,
      });
      expect(result.pieType).toBe('donut');
    });
  });
});
