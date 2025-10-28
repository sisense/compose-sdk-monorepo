import {
  LegendPosition,
  LegendSettings,
} from '@/chart-options-processor/translations/legend-section';
import type { LegendOptions } from '@/types';

import { getBasicCartesianLegend } from './legend';

describe('legend.ts', () => {
  describe('getBasicCartesianLegend', () => {
    const defaultSettings = {
      enabled: false,
      symbolRadius: 0,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      align: 'center' as const,
      verticalAlign: 'bottom' as const,
      layout: 'horizontal' as const,
    };

    const legendItemStyleDefault = {
      fontSize: '13px',
      fontWeight: 'normal',
      textOutline: 'none',
      pointerEvents: 'auto',
    };

    describe('basic cases', () => {
      it('should return default settings when legend is undefined', () => {
        const result = getBasicCartesianLegend(undefined);

        expect(result).toEqual(defaultSettings);
      });

      it('should return default settings when legend is null', () => {
        const result = getBasicCartesianLegend(null as any);

        expect(result).toEqual(defaultSettings);
      });

      it('should return default settings when legend is empty object', () => {
        const result = getBasicCartesianLegend({} as LegendOptions);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemStyle: legendItemStyleDefault,
        });
      });
    });

    describe('position handling', () => {
      it('should handle bottom position', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: 'bottom',
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemStyle: legendItemStyleDefault,
        });
      });

      it('should handle left position', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: 'left',
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'left',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: legendItemStyleDefault,
        });
      });

      it('should handle right position', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: 'right',
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          itemStyle: legendItemStyleDefault,
        });
      });

      it('should handle top position', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: 'top',
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'center',
          verticalAlign: 'top',
          layout: 'horizontal',
          itemStyle: legendItemStyleDefault,
        });
      });

      it('should handle invalid position with default fallback', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: 'bottomright' as LegendPosition,
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemStyle: legendItemStyleDefault,
        });
      });

      it('should handle null position with default fallback', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: null,
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemStyle: legendItemStyleDefault,
        });
      });
    });

    describe('legend options transformation', () => {
      it('should handle title options', () => {
        const legend: LegendOptions = {
          enabled: true,
          title: {
            enabled: true,
            text: 'Legend Title',
            textStyle: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
            },
          },
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.title).toEqual({
          text: 'Legend Title',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
          },
        });
      });

      it('should handle disabled title', () => {
        const legend: LegendOptions = {
          enabled: true,
          title: {
            enabled: false,
            text: 'Legend Title',
          },
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.title).toBeUndefined();
      });

      it('should handle items options', () => {
        const legend: LegendOptions = {
          enabled: true,
          items: {
            layout: 'vertical',
            distance: 10,
            marginTop: 5,
            marginBottom: 5,
            width: 200,
            textStyle: {
              fontSize: '14px',
              color: '#666',
            },
            hoverTextStyle: {
              color: '#000',
            },
            hiddenTextStyle: {
              color: '#ccc',
            },
          },
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.layout).toBe('vertical');
        expect(result.itemDistance).toBe(10);
        expect(result.itemMarginTop).toBe(5);
        expect(result.itemMarginBottom).toBe(5);
        expect(result.itemWidth).toBe(200);
        expect(result.itemHoverStyle).toEqual({
          color: '#000',
        });
        expect(result.itemHiddenStyle).toEqual({
          color: '#ccc',
        });
      });

      it('should handle symbols options', () => {
        const legend: LegendOptions = {
          enabled: true,
          symbols: {
            width: 20,
            height: 15,
            radius: 5,
            padding: 8,
            squared: false,
          },
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.symbolWidth).toBe(20);
        expect(result.symbolHeight).toBe(15);
        expect(result.symbolRadius).toBe(5);
        expect(result.symbolPadding).toBe(8);
        expect(result.squareSymbol).toBe(false);
      });

      it('should handle offsets', () => {
        const legend: LegendOptions = {
          enabled: true,
          xOffset: 10,
          yOffset: -5,
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.x).toBe(10);
        expect(result.y).toBe(-5);
      });

      it('should handle basic color properties', () => {
        const legend: LegendOptions = {
          enabled: true,
          backgroundColor: '#f0f0f0',
          borderColor: '#cccccc',
          borderWidth: 2,
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.backgroundColor).toBe('#f0f0f0');
        expect(result.borderColor).toBe('#cccccc');
        expect(result.borderWidth).toBe(2);
      });

      it('should handle other legend properties', () => {
        const legend: LegendOptions = {
          enabled: true,
          maxHeight: 100,
          margin: 20,
          padding: 15,
          borderRadius: 8,
          shadow: true,
          reversed: true,
          rtl: true,
          floating: true,
          width: 300,
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.maxHeight).toBe(100);
        expect(result.margin).toBe(20);
        expect(result.padding).toBe(15);
        expect(result.borderRadius).toBe(8);
        expect(result.shadow).toBe(true);
        expect(result.reversed).toBe(true);
        expect(result.rtl).toBe(true);
        expect(result.floating).toBe(true);
        expect(result.width).toBe(300);
      });
    });

    describe('itemStyle handling', () => {
      it('should merge custom itemStyle with defaults', () => {
        const legend: LegendOptions = {
          enabled: true,
          items: {
            textStyle: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
            },
          },
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.itemStyle).toEqual({
          fontSize: '16px',
          fontWeight: 'bold',
          textOutline: 'none',
          pointerEvents: 'auto',
          color: '#333',
        });
      });

      it('should use default itemStyle when no custom style provided', () => {
        const legend: LegendOptions = {
          enabled: true,
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.itemStyle).toEqual(legendItemStyleDefault);
      });
    });

    describe('gradient color handling', () => {
      it('should handle gradient backgroundColor', () => {
        const gradientColor = {
          type: 'linear' as const,
          direction: {
            x1: 0,
            y1: 0,
            x2: 1,
            y2: 0,
          },
          stops: [
            { position: 0, color: '#ff0000' },
            { position: 1, color: '#0000ff' },
          ],
        };

        const legend: LegendOptions = {
          enabled: true,
          backgroundColor: gradientColor,
        };

        const result = getBasicCartesianLegend(legend);

        // The gradient should be transformed to Highcharts format
        expect(result.backgroundColor).toEqual({
          linearGradient: { x1: 0, y1: 0, x2: 1, y2: 0 },
          stops: [
            [0, '#ff0000'],
            [1, '#0000ff'],
          ],
        });
      });

      it('should handle gradient borderColor', () => {
        const gradientColor = {
          type: 'radial' as const,
          center: {
            centerX: 0.5,
            centerY: 0.5,
            radius: 0.5,
          },
          stops: [
            { position: 0, color: '#ffffff' },
            { position: 1, color: '#000000' },
          ],
        };

        const legend: LegendOptions = {
          enabled: true,
          borderColor: gradientColor,
        };

        const result = getBasicCartesianLegend(legend);

        // The gradient should be transformed to Highcharts format
        expect(result.borderColor).toEqual({
          radialGradient: { cx: 0.5, cy: 0.5, r: 0.5 },
          stops: [
            [0, '#ffffff'],
            [1, '#000000'],
          ],
        });
      });
    });

    describe('complex scenarios', () => {
      it('should handle complete legend configuration', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: 'right',
          maxHeight: 200,
          margin: 15,
          padding: 10,
          backgroundColor: '#ffffff',
          borderColor: '#dddddd',
          borderWidth: 1,
          borderRadius: 4,
          shadow: true,
          reversed: false,
          rtl: false,
          floating: false,
          width: 250,
          xOffset: 5,
          yOffset: -10,
          title: {
            enabled: true,
            text: 'Data Series',
            textStyle: {
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
            },
          },
          items: {
            layout: 'vertical',
            distance: 8,
            marginTop: 4,
            marginBottom: 4,
            width: 200,
            textStyle: {
              fontSize: '12px',
              color: '#666',
            },
            hoverTextStyle: {
              color: '#000',
            },
            hiddenTextStyle: {
              color: '#999',
            },
          },
          symbols: {
            width: 16,
            height: 12,
            radius: 3,
            padding: 6,
            squared: true,
          },
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          enabled: true,
          align: 'right',
          verticalAlign: 'middle',
          layout: 'vertical',
          maxHeight: 200,
          margin: 15,
          padding: 10,
          backgroundColor: '#ffffff',
          borderColor: '#dddddd',
          borderWidth: 1,
          borderRadius: 4,
          shadow: true,
          reversed: false,
          rtl: false,
          floating: false,
          width: 250,
          x: 5,
          y: -10,
          title: {
            text: 'Data Series',
            style: {
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
            },
          },
          itemDistance: 8,
          itemMarginTop: 4,
          itemMarginBottom: 4,
          itemWidth: 200,
          itemHoverStyle: {
            color: '#000',
          },
          itemHiddenStyle: {
            color: '#999',
          },
          symbolWidth: 16,
          symbolHeight: 12,
          symbolRadius: 3,
          symbolPadding: 6,
          squareSymbol: true,
          itemStyle: {
            fontSize: '12px',
            fontWeight: 'normal',
            textOutline: 'none',
            pointerEvents: 'auto',
            color: '#666',
          },
        });
      });

      it('should handle minimal legend configuration', () => {
        const legend: LegendOptions = {
          enabled: true,
        };

        const result = getBasicCartesianLegend(legend);

        expect(result).toEqual({
          ...defaultSettings,
          enabled: true,
          align: 'center',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemStyle: legendItemStyleDefault,
        });
      });

      it('should handle disabled legend', () => {
        const legend: LegendOptions = {
          enabled: false,
          position: 'top',
        };

        const result = getBasicCartesianLegend(legend);

        expect(result.enabled).toBe(false);
        expect(result.align).toBe('center');
        expect(result.verticalAlign).toBe('top');
        expect(result.layout).toBe('horizontal');
      });
    });

    describe('type safety', () => {
      it('should return LegendSettings type', () => {
        const legend: LegendOptions = {
          enabled: true,
          position: 'left',
        };

        const result: LegendSettings = getBasicCartesianLegend(legend);

        // Type assertions to ensure the function returns the correct type
        expect(typeof result.enabled).toBe('boolean');
        expect(typeof result.align).toBe('string');
        expect(typeof result.verticalAlign).toBe('string');
        expect(typeof result.layout).toBe('string');
      });
    });
  });
});
