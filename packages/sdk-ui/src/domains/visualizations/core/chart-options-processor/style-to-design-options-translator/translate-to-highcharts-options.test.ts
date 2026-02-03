import { PieStyleOptions } from '@/types';

import { getPieChartDesignOptions } from './translate-to-highcharts-options.js';

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

    it('should handle labels configuration correctly with donut subtype', () => {
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
