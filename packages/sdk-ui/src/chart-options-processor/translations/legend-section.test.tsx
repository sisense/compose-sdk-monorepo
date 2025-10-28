/** @vitest-environment jsdom */
import { render } from '@testing-library/react';

import { AreaChart } from '../../area-chart';
import { AreaRangeChart } from '../../area-range-chart';
import { BarChart } from '../../bar-chart';
import { Chart } from '../../chart';
import { ColumnChart } from '../../column-chart';
import { FunnelChart } from '../../funnel-chart';
import { LineChart } from '../../line-chart';
import { PieChart } from '../../pie-chart';
import { PolarChart } from '../../polar-chart';
import { ScatterChart } from '../../scatter-chart';
import { SunburstChart } from '../../sunburst-chart';
import { LegendOptions } from '../../types';
import {
  createLinearGradient,
  createRadialGradient,
  GradientDirections,
  RadialGradientPresets,
} from '../../utils/gradient';
import { HighchartsOptions } from '../chart-options-service';
import { getLegendSettings } from './legend-section';

// Mock Highcharts
vi.mock('highcharts-react-official', () => ({
  default: ({ options }: { options: HighchartsOptions }) => {
    return <div data-testid="highcharts-mock" data-options={JSON.stringify(options)} />;
  },
}));

const dataSet = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 6781, 10],
    ['2010', 'A', 4471, 70],
    ['2011', 'B', 1812, 50],
    ['2012', 'B', 5001, 60],
    ['2013', 'A', 2045, 40],
    ['2014', 'B', 3010, 90],
    ['2015', 'A', 5447, 80],
    ['2016', 'B', 4242, 70],
    ['2018', 'B', 936, 20],
  ],
};

const cat1 = {
  name: 'Years',
  type: 'date',
};

const cat2 = {
  name: 'Group',
  type: 'string',
};

const meas1 = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};

describe('getLegendSettings', () => {
  describe('Direct function tests', () => {
    it('should return default settings when no legend options provided', () => {
      const result = getLegendSettings();

      expect(result).toEqual({
        enabled: false,
        symbolRadius: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      });
    });

    it('should return default settings when legend is undefined', () => {
      const result = getLegendSettings(undefined);

      expect(result).toEqual({
        enabled: false,
        symbolRadius: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      });
    });

    it('should handle basic enabled legend', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.align).toBe('center');
      expect(result.verticalAlign).toBe('bottom');
      expect(result.layout).toBe('horizontal');
      expect(result.itemStyle).toEqual({
        fontSize: '13px',
        fontWeight: 'normal',
        textOutline: 'none',
        pointerEvents: 'auto',
      });
    });

    it('should handle position-based legend settings', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        position: 'top',
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.align).toBe('center');
      expect(result.verticalAlign).toBe('top');
      expect(result.layout).toBe('horizontal');
    });

    it('should handle top position', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        position: 'top',
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.align).toBe('center');
      expect(result.verticalAlign).toBe('top');
      expect(result.layout).toBe('horizontal');
    });

    it('should handle left position', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        position: 'left',
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.align).toBe('left');
      expect(result.verticalAlign).toBe('middle');
      expect(result.layout).toBe('vertical');
    });

    it('should handle right position', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        position: 'right',
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.align).toBe('right');
      expect(result.verticalAlign).toBe('middle');
      expect(result.layout).toBe('vertical');
    });

    it('should handle bottom position', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        position: 'bottom',
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.align).toBe('center');
      expect(result.verticalAlign).toBe('bottom');
      expect(result.layout).toBe('horizontal');
    });

    it('should handle legend title options', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        title: {
          enabled: true,
          text: 'Legend Title',
          textStyle: {
            fontSize: '16px',
            color: 'red',
          },
        },
      };

      const result = getLegendSettings(legendOptions);

      expect(result.title).toEqual({
        text: 'Legend Title',
        style: {
          fontSize: '16px',
          color: 'red',
        },
      });
    });

    it('should handle disabled legend title', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        title: {
          enabled: false,
          text: 'Legend Title',
        },
      };

      const result = getLegendSettings(legendOptions);

      expect(result.title).toBeUndefined();
    });

    it('should handle legend items options', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        items: {
          layout: 'vertical',
          distance: 20,
          marginTop: 10,
          marginBottom: 15,
          width: 100,
          textStyle: {
            fontSize: '14px',
            color: 'blue',
          },
          hoverTextStyle: {
            color: 'green',
          },
          hiddenTextStyle: {
            color: 'gray',
          },
        },
      };

      const result = getLegendSettings(legendOptions);

      expect(result.layout).toBe('vertical');
      expect(result.itemDistance).toBe(20);
      expect(result.itemMarginTop).toBe(10);
      expect(result.itemMarginBottom).toBe(15);
      expect(result.itemWidth).toBe(100);
      expect(result.itemStyle).toEqual({
        fontSize: '14px',
        fontWeight: 'normal',
        color: 'blue',
        textOutline: 'none',
        pointerEvents: 'auto',
      });
      expect(result.itemHoverStyle).toEqual({
        color: 'green',
      });
      expect(result.itemHiddenStyle).toEqual({
        color: 'gray',
      });
    });

    it('should handle legend symbols options', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        symbols: {
          radius: 5,
          height: 20,
          width: 30,
          padding: 10,
          squared: true,
        },
      };

      const result = getLegendSettings(legendOptions);

      expect(result.symbolRadius).toBe(5);
      expect(result.symbolHeight).toBe(20);
      expect(result.symbolWidth).toBe(30);
      expect(result.symbolPadding).toBe(10);
      expect(result.squareSymbol).toBe(true);
    });

    it('should handle offset options', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        xOffset: 50,
        yOffset: 25,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.x).toBe(50);
      expect(result.y).toBe(25);
    });

    it('should handle all legend properties', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        position: 'right',
        align: 'right',
        verticalAlign: 'middle',
        maxHeight: 200,
        margin: 10,
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderWidth: 2,
        borderColor: '#333',
        borderRadius: 8,
        shadow: true,
        reversed: true,
        rtl: true,
        floating: true,
        width: 150,
        title: {
          enabled: true,
          text: 'Custom Legend',
          textStyle: { fontSize: '18px' },
        },
        items: {
          layout: 'vertical',
          distance: 15,
          textStyle: { color: 'purple' },
        },
        symbols: {
          radius: 3,
          squared: false,
        },
        xOffset: 20,
        yOffset: 30,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.align).toBe('right');
      expect(result.verticalAlign).toBe('middle');
      expect(result.layout).toBe('vertical');
      expect(result.maxHeight).toBe(200);
      expect(result.margin).toBe(10);
      expect(result.padding).toBe(5);
      expect(result.backgroundColor).toBe('#f0f0f0');
      expect(result.borderWidth).toBe(2);
      expect(result.borderColor).toBe('#333');
      expect(result.borderRadius).toBe(8);
      expect(result.shadow).toBe(true);
      expect(result.reversed).toBe(true);
      expect(result.rtl).toBe(true);
      expect(result.floating).toBe(true);
      expect(result.width).toBe(150);
      expect(result.title).toEqual({
        text: 'Custom Legend',
        style: { fontSize: '18px' },
      });
      expect(result.itemDistance).toBe(15);
      expect(result.itemStyle).toEqual({
        fontSize: '13px',
        fontWeight: 'normal',
        color: 'purple',
        textOutline: 'none',
        pointerEvents: 'auto',
      });
      expect(result.symbolRadius).toBe(3);
      expect(result.squareSymbol).toBe(false);
      expect(result.x).toBe(20);
      expect(result.y).toBe(30);
    });

    it('should handle linear gradient in backgroundColor', () => {
      const linearGradient = createLinearGradient(GradientDirections.topToBottom, [
        { position: 0, color: '#003399' },
        { position: 0.5, color: '#ffffff' },
        { position: 1, color: '#3366AA' },
      ]);

      const legendOptions: LegendOptions = {
        enabled: true,
        backgroundColor: linearGradient,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.backgroundColor).toEqual({
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
        },
        stops: [
          [0, '#003399'],
          [0.5, '#ffffff'],
          [1, '#3366AA'],
        ],
      });
    });

    it('should handle radial gradient in backgroundColor', () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.center, [
        { position: 0, color: '#ff0000' },
        { position: 1, color: '#0000ff' },
      ]);

      const legendOptions: LegendOptions = {
        enabled: true,
        backgroundColor: radialGradient,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.backgroundColor).toEqual({
        radialGradient: {
          cx: 0.5,
          cy: 0.5,
          r: 0.8,
        },
        stops: [
          [0, '#ff0000'],
          [1, '#0000ff'],
        ],
      });
    });

    it('should handle linear gradient in borderColor', () => {
      const linearGradient = createLinearGradient(GradientDirections.leftToRight, [
        { position: 0, color: '#ff6b6b' },
        { position: 1, color: '#4ecdc4' },
      ]);

      const legendOptions: LegendOptions = {
        enabled: true,
        borderColor: linearGradient,
        borderWidth: 3,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.borderWidth).toBe(3);
      expect(result.borderColor).toEqual({
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 0,
        },
        stops: [
          [0, '#ff6b6b'],
          [1, '#4ecdc4'],
        ],
      });
    });

    it('should handle radial gradient in borderColor', () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.topLeft, [
        { position: 0, color: '#667eea' },
        { position: 0.5, color: '#764ba2' },
        { position: 1, color: '#f093fb' },
      ]);

      const legendOptions: LegendOptions = {
        enabled: true,
        borderColor: radialGradient,
        borderWidth: 2,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.borderWidth).toBe(2);
      expect(result.borderColor).toEqual({
        radialGradient: {
          cx: 0,
          cy: 0,
          r: 1,
        },
        stops: [
          [0, '#667eea'],
          [0.5, '#764ba2'],
          [1, '#f093fb'],
        ],
      });
    });

    it('should handle both gradient backgroundColor and borderColor', () => {
      const linearBgGradient = createLinearGradient(GradientDirections.diagonalTopLeft, [
        { position: 0, color: '#ff9a9e' },
        { position: 1, color: '#fecfef' },
      ]);

      const radialBorderGradient = createRadialGradient(RadialGradientPresets.bottomRight, [
        { position: 0, color: '#a8edea' },
        { position: 1, color: '#fed6e3' },
      ]);

      const legendOptions: LegendOptions = {
        enabled: true,
        backgroundColor: linearBgGradient,
        borderColor: radialBorderGradient,
        borderWidth: 4,
        borderRadius: 8,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.enabled).toBe(true);
      expect(result.borderWidth).toBe(4);
      expect(result.borderRadius).toBe(8);
      expect(result.backgroundColor).toEqual({
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 1,
          y2: 1,
        },
        stops: [
          [0, '#ff9a9e'],
          [1, '#fecfef'],
        ],
      });
      expect(result.borderColor).toEqual({
        radialGradient: {
          cx: 1,
          cy: 1,
          r: 1,
        },
        stops: [
          [0, '#a8edea'],
          [1, '#fed6e3'],
        ],
      });
    });

    it('should handle custom gradient directions', () => {
      const customLinearGradient = createLinearGradient({ x1: 0.2, y1: 0.3, x2: 0.8, y2: 0.7 }, [
        { position: 0, color: '#ff0000' },
        { position: 0.3, color: '#00ff00' },
        { position: 0.7, color: '#0000ff' },
        { position: 1, color: '#ffff00' },
      ]);

      const customRadialGradient = createRadialGradient(
        { centerX: 0.3, centerY: 0.7, radius: 0.6 },
        [
          { position: 0, color: '#purple' },
          { position: 1, color: '#orange' },
        ],
      );

      const legendOptions: LegendOptions = {
        enabled: true,
        backgroundColor: customLinearGradient,
        borderColor: customRadialGradient,
        borderWidth: 5,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.backgroundColor).toEqual({
        linearGradient: {
          x1: 0.2,
          y1: 0.3,
          x2: 0.8,
          y2: 0.7,
        },
        stops: [
          [0, '#ff0000'],
          [0.3, '#00ff00'],
          [0.7, '#0000ff'],
          [1, '#ffff00'],
        ],
      });
      expect(result.borderColor).toEqual({
        radialGradient: {
          cx: 0.3,
          cy: 0.7,
          r: 0.6,
        },
        stops: [
          [0, '#purple'],
          [1, '#orange'],
        ],
      });
    });

    it('should preserve string colors when not gradients', () => {
      const legendOptions: LegendOptions = {
        enabled: true,
        backgroundColor: '#f0f0f0',
        borderColor: '#333333',
        borderWidth: 2,
      };

      const result = getLegendSettings(legendOptions);

      expect(result.backgroundColor).toBe('#f0f0f0');
      expect(result.borderColor).toBe('#333333');
      expect(result.borderWidth).toBe(2);
    });
  });

  describe('Chart rendering tests with onBeforeRender verification', () => {
    it('should apply default legend settings when no legend options provided', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            // When no legend options are provided, the chart defaults to enabled: true
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('bottom');
            expect(options.legend?.layout).toBe('horizontal');
            expect(options.legend?.symbolRadius).toBe(0);
            expect(options.legend?.backgroundColor).toBe('transparent');
            expect(options.legend?.borderColor).toBe('transparent');
            expect(options.legend?.borderWidth).toBe(0);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply enabled legend with position settings', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'top',
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('top');
            expect(options.legend?.layout).toBe('horizontal');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend with title options', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              title: {
                enabled: true,
                text: 'Custom Legend Title',
                textStyle: {
                  fontSize: '16px',
                  color: 'red',
                },
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.title?.text).toBe('Custom Legend Title');
            expect(options.legend?.title?.style?.fontSize).toBe('16px');
            expect(options.legend?.title?.style?.color).toBe('red');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend with items configuration', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              items: {
                layout: 'vertical',
                distance: 25,
                marginTop: 15,
                marginBottom: 20,
                width: 120,
                textStyle: {
                  fontSize: '14px',
                  color: 'blue',
                },
                hoverTextStyle: {
                  color: 'green',
                },
                hiddenTextStyle: {
                  color: 'gray',
                },
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.layout).toBe('vertical');
            expect(options.legend?.itemDistance).toBe(25);
            expect(options.legend?.itemMarginTop).toBe(15);
            expect(options.legend?.itemMarginBottom).toBe(20);
            expect(options.legend?.itemWidth).toBe(120);
            expect(options.legend?.itemStyle?.fontSize).toBe('14px');
            expect(options.legend?.itemStyle?.color).toBe('blue');
            expect(options.legend?.itemHoverStyle?.color).toBe('green');
            expect(options.legend?.itemHiddenStyle?.color).toBe('gray');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend with symbols configuration', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              symbols: {
                radius: 8,
                height: 25,
                width: 35,
                padding: 12,
                squared: true,
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.symbolRadius).toBe(8);
            expect(options.legend?.symbolHeight).toBe(25);
            expect(options.legend?.symbolWidth).toBe(35);
            expect(options.legend?.symbolPadding).toBe(12);
            expect(options.legend?.squareSymbol).toBe(true);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend with offset configuration', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              xOffset: 60,
              yOffset: 40,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.x).toBe(60);
            expect(options.legend?.y).toBe(40);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply comprehensive legend configuration', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'left',
              align: 'left',
              verticalAlign: 'middle',
              maxHeight: 300,
              margin: 15,
              padding: 8,
              backgroundColor: '#f5f5f5',
              borderWidth: 3,
              borderColor: '#666',
              borderRadius: 10,
              shadow: true,
              reversed: true,
              rtl: true,
              floating: true,
              width: 180,
              title: {
                enabled: true,
                text: 'Comprehensive Legend',
                textStyle: { fontSize: '20px', color: 'darkblue' },
              },
              items: {
                layout: 'vertical',
                distance: 30,
                marginTop: 20,
                marginBottom: 25,
                width: 150,
                textStyle: { fontSize: '16px', color: 'purple' },
                hoverTextStyle: { color: 'orange' },
                hiddenTextStyle: { color: 'lightgray' },
              },
              symbols: {
                radius: 6,
                height: 30,
                width: 40,
                padding: 15,
                squared: false,
              },
              xOffset: 25,
              yOffset: 35,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('left');
            expect(options.legend?.verticalAlign).toBe('middle');
            expect(options.legend?.layout).toBe('vertical');
            expect(options.legend?.maxHeight).toBe(300);
            expect(options.legend?.margin).toBe(15);
            expect(options.legend?.padding).toBe(8);
            expect(options.legend?.backgroundColor).toBe('#f5f5f5');
            expect(options.legend?.borderWidth).toBe(3);
            expect(options.legend?.borderColor).toBe('#666');
            expect(options.legend?.borderRadius).toBe(10);
            expect(options.legend?.shadow).toBe(true);
            expect(options.legend?.reversed).toBe(true);
            expect(options.legend?.rtl).toBe(true);
            expect(options.legend?.floating).toBe(true);
            expect(options.legend?.width).toBe(180);
            expect(options.legend?.title?.text).toBe('Comprehensive Legend');
            expect(options.legend?.title?.style?.fontSize).toBe('20px');
            expect(options.legend?.title?.style?.color).toBe('darkblue');
            expect(options.legend?.itemDistance).toBe(30);
            expect(options.legend?.itemMarginTop).toBe(20);
            expect(options.legend?.itemMarginBottom).toBe(25);
            expect(options.legend?.itemWidth).toBe(150);
            expect(options.legend?.itemStyle?.fontSize).toBe('16px');
            expect(options.legend?.itemStyle?.color).toBe('purple');
            expect(options.legend?.itemHoverStyle?.color).toBe('orange');
            expect(options.legend?.itemHiddenStyle?.color).toBe('lightgray');
            expect(options.legend?.symbolRadius).toBe(6);
            expect(options.legend?.symbolHeight).toBe(30);
            expect(options.legend?.symbolWidth).toBe(40);
            expect(options.legend?.symbolPadding).toBe(15);
            expect(options.legend?.squareSymbol).toBe(false);
            expect(options.legend?.x).toBe(25);
            expect(options.legend?.y).toBe(35);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should handle disabled legend title', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              title: {
                enabled: false,
                text: 'This should not appear',
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.title).toBeUndefined();
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should merge default item style with custom item style', async () => {
      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              items: {
                textStyle: {
                  fontSize: '18px',
                  color: 'navy',
                },
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.itemStyle?.fontFamily).toBe(
              '"Open Sans","Roboto","Helvetica","Arial",sans-serif',
            );
            expect(options.legend?.itemStyle?.fontSize).toBe('18px');
            expect(options.legend?.itemStyle?.fontWeight).toBe('normal');
            expect(options.legend?.itemStyle?.color).toBe('navy');
            expect(options.legend?.itemStyle?.textOutline).toBe('none');
            expect(options.legend?.itemStyle?.pointerEvents).toBe('auto');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply linear gradient backgroundColor to legend', async () => {
      const linearGradient = createLinearGradient(GradientDirections.topToBottom, [
        { position: 0, color: '#667eea' },
        { position: 1, color: '#764ba2' },
      ]);

      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              backgroundColor: linearGradient,
              borderWidth: 2,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.backgroundColor).toEqual({
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1,
              },
              stops: [
                [0, '#667eea'],
                [1, '#764ba2'],
              ],
            });
            expect(options.legend?.borderWidth).toBe(2);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply radial gradient borderColor to legend', async () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.center, [
        { position: 0, color: '#ff6b6b' },
        { position: 0.5, color: '#4ecdc4' },
        { position: 1, color: '#45b7d1' },
      ]);

      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              borderColor: radialGradient,
              borderWidth: 3,
              borderRadius: 10,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.borderColor).toEqual({
              radialGradient: {
                cx: 0.5,
                cy: 0.5,
                r: 0.8,
              },
              stops: [
                [0, '#ff6b6b'],
                [0.5, '#4ecdc4'],
                [1, '#45b7d1'],
              ],
            });
            expect(options.legend?.borderWidth).toBe(3);
            expect(options.legend?.borderRadius).toBe(10);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply both gradient backgroundColor and borderColor to legend', async () => {
      const linearBgGradient = createLinearGradient(GradientDirections.diagonalTopRight, [
        { position: 0, color: '#a8edea' },
        { position: 1, color: '#fed6e3' },
      ]);

      const radialBorderGradient = createRadialGradient(RadialGradientPresets.topRight, [
        { position: 0, color: '#ff9a9e' },
        { position: 1, color: '#fecfef' },
      ]);

      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              backgroundColor: linearBgGradient,
              borderColor: radialBorderGradient,
              borderWidth: 4,
              borderRadius: 12,
              padding: 15,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.backgroundColor).toEqual({
              linearGradient: {
                x1: 1,
                y1: 0,
                x2: 0,
                y2: 1,
              },
              stops: [
                [0, '#a8edea'],
                [1, '#fed6e3'],
              ],
            });
            expect(options.legend?.borderColor).toEqual({
              radialGradient: {
                cx: 1,
                cy: 0,
                r: 1,
              },
              stops: [
                [0, '#ff9a9e'],
                [1, '#fecfef'],
              ],
            });
            expect(options.legend?.borderWidth).toBe(4);
            expect(options.legend?.borderRadius).toBe(12);
            expect(options.legend?.padding).toBe(15);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply custom gradient directions to legend', async () => {
      const customLinearGradient = createLinearGradient({ x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8 }, [
        { position: 0, color: '#667eea' },
        { position: 0.3, color: '#764ba2' },
        { position: 0.7, color: '#f093fb' },
        { position: 1, color: '#f5576c' },
      ]);

      const customRadialGradient = createRadialGradient(
        { centerX: 0.4, centerY: 0.6, radius: 0.5 },
        [
          { position: 0, color: '#4facfe' },
          { position: 1, color: '#00f2fe' },
        ],
      );

      const { findByLabelText } = render(
        <Chart
          dataSet={dataSet}
          chartType={'line'}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              backgroundColor: customLinearGradient,
              borderColor: customRadialGradient,
              borderWidth: 5,
              position: 'right',
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.backgroundColor).toEqual({
              linearGradient: {
                x1: 0.1,
                y1: 0.2,
                x2: 0.9,
                y2: 0.8,
              },
              stops: [
                [0, '#667eea'],
                [0.3, '#764ba2'],
                [0.7, '#f093fb'],
                [1, '#f5576c'],
              ],
            });
            expect(options.legend?.borderColor).toEqual({
              radialGradient: {
                cx: 0.4,
                cy: 0.6,
                r: 0.5,
              },
              stops: [
                [0, '#4facfe'],
                [1, '#00f2fe'],
              ],
            });
            expect(options.legend?.borderWidth).toBe(5);
            expect(options.legend?.align).toBe('right');
            expect(options.legend?.verticalAlign).toBe('middle');
            expect(options.legend?.layout).toBe('vertical');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });
  });

  describe('Individual chart type tests with legend options', () => {
    it('should apply legend options to LineChart', async () => {
      const { findByLabelText } = render(
        <LineChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'right',
              title: {
                enabled: true,
                text: 'Line Chart Legend',
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('right');
            expect(options.legend?.verticalAlign).toBe('middle');
            expect(options.legend?.layout).toBe('vertical');
            expect(options.legend?.title?.text).toBe('Line Chart Legend');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to AreaChart', async () => {
      const { findByLabelText } = render(
        <AreaChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'top',
              backgroundColor: '#f0f0f0',
              borderWidth: 2,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('top');
            expect(options.legend?.layout).toBe('horizontal');
            expect(options.legend?.backgroundColor).toBe('#f0f0f0');
            expect(options.legend?.borderWidth).toBe(2);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to AreaRangeChart', async () => {
      const { findByLabelText } = render(
        <AreaRangeChart
          dataSet={dataSet}
          dataOptions={{
            category: [cat1],
            value: [
              {
                title: 'Quantity Range',
                upperBound: {
                  name: 'Quantity',
                  aggregation: 'sum',
                },
                lowerBound: {
                  name: 'Units',
                  aggregation: 'sum',
                },
              },
            ],
            breakBy: [],
          }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'bottom',
              items: {
                layout: 'horizontal',
                distance: 20,
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('bottom');
            expect(options.legend?.layout).toBe('horizontal');
            expect(options.legend?.itemDistance).toBe(20);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to ColumnChart', async () => {
      const { findByLabelText } = render(
        <ColumnChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [cat2] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'left',
              symbols: {
                radius: 3,
                squared: true,
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('left');
            expect(options.legend?.verticalAlign).toBe('middle');
            expect(options.legend?.layout).toBe('vertical');
            expect(options.legend?.symbolRadius).toBe(3);
            expect(options.legend?.squareSymbol).toBe(true);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to BarChart', async () => {
      const { findByLabelText } = render(
        <BarChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [cat2] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'right',
              maxHeight: 200,
              margin: 10,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('right');
            expect(options.legend?.verticalAlign).toBe('middle');
            expect(options.legend?.layout).toBe('vertical');
            expect(options.legend?.maxHeight).toBe(200);
            expect(options.legend?.margin).toBe(10);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to PieChart', async () => {
      const { findByLabelText } = render(
        <PieChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'bottom',
              title: {
                enabled: true,
                text: 'Pie Chart Legend',
                textStyle: { fontSize: '16px' },
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('bottom');
            expect(options.legend?.layout).toBe('horizontal');
            expect(options.legend?.title?.text).toBe('Pie Chart Legend');
            expect(options.legend?.title?.style?.fontSize).toBe('16px');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to FunnelChart', async () => {
      const { findByLabelText } = render(
        <FunnelChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'right',
              items: {
                textStyle: { color: 'darkblue' },
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('right');
            expect(options.legend?.verticalAlign).toBe('middle');
            expect(options.legend?.layout).toBe('vertical');
            expect(options.legend?.itemStyle?.color).toBe('darkblue');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to PolarChart', async () => {
      const { findByLabelText } = render(
        <PolarChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'top',
              floating: true,
              width: 150,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('top');
            expect(options.legend?.layout).toBe('horizontal');
            expect(options.legend?.floating).toBe(true);
            expect(options.legend?.width).toBe(150);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to ScatterChart', async () => {
      const { findByLabelText } = render(
        <ScatterChart
          dataSet={dataSet}
          dataOptions={{ x: cat1, y: meas1, breakByPoint: cat2 }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'bottom',
              symbols: {
                radius: 4,
                height: 15,
                width: 15,
              },
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('bottom');
            expect(options.legend?.layout).toBe('horizontal');
            expect(options.legend?.symbolRadius).toBe(4);
            expect(options.legend?.symbolHeight).toBe(15);
            expect(options.legend?.symbolWidth).toBe(15);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply legend options to SunburstChart', async () => {
      const { findByLabelText } = render(
        <SunburstChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1, cat2], value: [meas1] }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'right',
              reversed: true,
              rtl: false,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.align).toBe('right');
            expect(options.legend?.verticalAlign).toBe('middle');
            expect(options.legend?.layout).toBe('vertical');
            expect(options.legend?.reversed).toBe(true);
            expect(options.legend?.rtl).toBe(false);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply gradient legend options to PieChart', async () => {
      const linearGradient = createLinearGradient(GradientDirections.leftToRight, [
        { position: 0, color: '#ff9a9e' },
        { position: 1, color: '#fecfef' },
      ]);

      const { findByLabelText } = render(
        <PieChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1] }}
          styleOptions={{
            legend: {
              enabled: true,
              backgroundColor: linearGradient,
              borderWidth: 3,
              borderRadius: 15,
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.backgroundColor).toEqual({
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 1,
                y2: 0,
              },
              stops: [
                [0, '#ff9a9e'],
                [1, '#fecfef'],
              ],
            });
            expect(options.legend?.borderWidth).toBe(3);
            expect(options.legend?.borderRadius).toBe(15);
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });

    it('should apply gradient legend options to BarChart', async () => {
      const radialGradient = createRadialGradient(RadialGradientPresets.bottomLeft, [
        { position: 0, color: '#667eea' },
        { position: 1, color: '#764ba2' },
      ]);

      const { findByLabelText } = render(
        <BarChart
          dataSet={dataSet}
          dataOptions={{ category: [cat1], value: [meas1], breakBy: [cat2] }}
          styleOptions={{
            legend: {
              enabled: true,
              borderColor: radialGradient,
              borderWidth: 4,
              position: 'top',
            },
          }}
          onBeforeRender={(options: HighchartsOptions) => {
            expect(options.legend).toBeDefined();
            expect(options.legend?.enabled).toBe(true);
            expect(options.legend?.borderColor).toEqual({
              radialGradient: {
                cx: 0,
                cy: 1,
                r: 1,
              },
              stops: [
                [0, '#667eea'],
                [1, '#764ba2'],
              ],
            });
            expect(options.legend?.borderWidth).toBe(4);
            expect(options.legend?.align).toBe('center');
            expect(options.legend?.verticalAlign).toBe('top');
            expect(options.legend?.layout).toBe('horizontal');
            return options;
          }}
        />,
      );

      expect(await findByLabelText('chart-root')).toBeInTheDocument();
    });
  });
});
