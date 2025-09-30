import { translateStyleOptionsToDesignOptions } from './index';
import { FunnelChartStyleOptions } from '../types';

describe('Funnel Chart Design Options', () => {
  describe('translateStyleOptionsToDesignOptions', () => {
    it('should default to regular funnel type when no subtype is provided', () => {
      const styleOptions: FunnelChartStyleOptions = {};

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.funnelType).toBe('regular');
      expect(result.funnelSize).toBe('regular');
      expect(result.funnelDirection).toBe('regular');
    });

    it('should set funnel properties correctly', () => {
      const styleOptions: FunnelChartStyleOptions = {
        funnelType: 'pinched',
        funnelSize: 'wide',
        funnelDirection: 'inverted',
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.funnelType).toBe('pinched');
      expect(result.funnelSize).toBe('wide');
      expect(result.funnelDirection).toBe('inverted');
    });

    it('should handle labels configuration correctly', () => {
      const styleOptions: FunnelChartStyleOptions = {
        funnelType: 'pinched',
        labels: {
          enabled: true,
          categories: true,
          value: true,
          percent: true,
          decimals: true,
        },
      };

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.funnelLabels).toEqual({
        enabled: true,
        showCategories: true,
        showValue: true,
        showPercent: true,
        showDecimals: true,
      });
      expect(result.funnelType).toBe('pinched');
    });

    it('should set default data limits', () => {
      const styleOptions: FunnelChartStyleOptions = {};

      const result = translateStyleOptionsToDesignOptions(styleOptions);

      expect(result.dataLimits).toEqual({
        categoriesCapacity: 50000,
        seriesCapacity: 50000,
      });
    });
  });
});
