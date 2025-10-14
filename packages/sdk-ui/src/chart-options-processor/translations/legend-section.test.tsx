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
  });
});
