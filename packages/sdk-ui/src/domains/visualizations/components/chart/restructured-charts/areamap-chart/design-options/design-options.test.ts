import * as DM from '@/__test-helpers__/sample-ecommerce';
import { AreamapChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { AreamapStyleOptions } from '@/types';

import { areamapDesignOptionsTranslators } from './design-options.js';

describe('areamapDesignOptionsTranslators', () => {
  describe('translateStyleOptionsToDesignOptions', () => {
    it('should return a design options object with mapType from styleOptions', () => {
      const styleOptions: AreamapStyleOptions = { mapType: 'usa' };
      const dataOptionsInternal: AreamapChartDataOptionsInternal = {
        geo: { column: DM.Country.Country },
      };
      const result = areamapDesignOptionsTranslators.translateStyleOptionsToDesignOptions(
        styleOptions,
        dataOptionsInternal,
      );
      expect(result).toMatchObject({ mapType: 'usa' });
    });

    it('should return a design options object with mapType set to world if styleOptions is empty', () => {
      const styleOptions = {};
      const dataOptionsInternal: AreamapChartDataOptionsInternal = {
        geo: { column: DM.Country.Country },
      };
      const result = areamapDesignOptionsTranslators.translateStyleOptionsToDesignOptions(
        styleOptions,
        dataOptionsInternal,
      );
      expect(result).toMatchObject({ mapType: 'world' });
    });
  });

  describe('isCorrectStyleOptions', () => {
    it('should return true if styleOptions is an object', () => {
      const styleOptions: AreamapStyleOptions = {};
      const result = areamapDesignOptionsTranslators.isCorrectStyleOptions(styleOptions);
      expect(result).toBe(true);
    });

    it('should return false if styleOptions is null', () => {
      const styleOptions: AreamapStyleOptions = null as unknown as AreamapStyleOptions;
      const result = areamapDesignOptionsTranslators.isCorrectStyleOptions(styleOptions);
      expect(result).toBe(false);
    });

    it('should return false if styleOptions is not an object', () => {
      const styleOptions: AreamapStyleOptions = 'not an object' as AreamapStyleOptions;
      const result = areamapDesignOptionsTranslators.isCorrectStyleOptions(styleOptions);
      expect(result).toBe(false);
    });
  });
});
