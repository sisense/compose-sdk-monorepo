import {
  LegendPosition,
  LegendSettings,
} from '@/domains/visualizations/core/chart-options-processor/translations/legend-section.js';

import { getBasicCategoricalLegend } from './legend.js';

describe('legend.ts', () => {
  describe('getBasicCategoricalLegend', () => {
    const expectedAdditionalSettings = {
      symbolRadius: 0,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      itemStyle: {
        fontFamily: 'Open Sans',
        fontSize: '13px',
        fontWeight: 'normal',
        color: '#5b6372',
        textOutline: 'none',
        pointerEvents: 'auto',
      },
    };

    it('should return disabled legend when position is null', () => {
      const result = getBasicCategoricalLegend(null);

      expect(result).toEqual({
        enabled: false,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      });
    });

    it('should return disabled legend when position is undefined', () => {
      const result = getBasicCategoricalLegend(undefined as unknown as LegendPosition);

      expect(result).toEqual({
        enabled: false,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      });
    });

    it('should return bottom-positioned legend configuration', () => {
      const result = getBasicCategoricalLegend('bottom');

      expect(result).toEqual({
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        ...expectedAdditionalSettings,
      });
    });

    it('should return left-positioned legend configuration', () => {
      const result = getBasicCategoricalLegend('left');

      expect(result).toEqual({
        enabled: true,
        align: 'left',
        verticalAlign: 'middle',
        layout: 'vertical',
        ...expectedAdditionalSettings,
      });
    });

    it('should return right-positioned legend configuration', () => {
      const result = getBasicCategoricalLegend('right');

      expect(result).toEqual({
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
        ...expectedAdditionalSettings,
      });
    });

    it('should return top-positioned legend configuration', () => {
      const result = getBasicCategoricalLegend('top');

      expect(result).toEqual({
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
        ...expectedAdditionalSettings,
      });
    });

    it('should return default configuration for unknown position values', () => {
      // Test with an invalid position that would fall through to default case
      const result = getBasicCategoricalLegend('bottomright' as LegendPosition);

      expect(result).toEqual({
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
        ...expectedAdditionalSettings,
      });
    });

    describe('legend settings properties', () => {
      it('should include all required additional settings for enabled legends', () => {
        const result = getBasicCategoricalLegend('bottom');

        expect(result).toHaveProperty('symbolRadius', 0);
        expect(result).toHaveProperty('backgroundColor', 'transparent');
        expect(result).toHaveProperty('borderColor', 'transparent');
        expect(result).toHaveProperty('borderWidth', 0);
        expect(result).toHaveProperty('itemStyle');
      });

      it('should have correct itemStyle configuration', () => {
        const result = getBasicCategoricalLegend('top');

        expect(result.itemStyle).toEqual({
          fontFamily: 'Open Sans',
          fontSize: '13px',
          fontWeight: 'normal',
          color: '#5b6372',
          textOutline: 'none',
          pointerEvents: 'auto',
        });
      });

      it('should return LegendSettings type', () => {
        const result: LegendSettings = getBasicCategoricalLegend('left');

        // Type assertions to ensure the function returns the correct type
        expect(typeof result.enabled).toBe('boolean');
        expect(typeof result.align).toBe('string');
        expect(typeof result.verticalAlign).toBe('string');
        expect(typeof result.layout).toBe('string');
      });
    });

    describe('layout configurations', () => {
      it('should use horizontal layout for top and bottom positions', () => {
        expect(getBasicCategoricalLegend('top').layout).toBe('horizontal');
        expect(getBasicCategoricalLegend('bottom').layout).toBe('horizontal');
      });

      it('should use vertical layout for left and right positions', () => {
        expect(getBasicCategoricalLegend('left').layout).toBe('vertical');
        expect(getBasicCategoricalLegend('right').layout).toBe('vertical');
      });
    });

    describe('alignment configurations', () => {
      it('should center align for top and bottom positions', () => {
        expect(getBasicCategoricalLegend('top').align).toBe('center');
        expect(getBasicCategoricalLegend('bottom').align).toBe('center');
      });

      it('should use specific alignment for left and right positions', () => {
        expect(getBasicCategoricalLegend('left').align).toBe('left');
        expect(getBasicCategoricalLegend('right').align).toBe('right');
      });

      it('should use middle vertical alignment for left and right positions', () => {
        expect(getBasicCategoricalLegend('left').verticalAlign).toBe('middle');
        expect(getBasicCategoricalLegend('right').verticalAlign).toBe('middle');
      });

      it('should use specific vertical alignment for top and bottom positions', () => {
        expect(getBasicCategoricalLegend('top').verticalAlign).toBe('top');
        expect(getBasicCategoricalLegend('bottom').verticalAlign).toBe('bottom');
      });
    });
  });
});
