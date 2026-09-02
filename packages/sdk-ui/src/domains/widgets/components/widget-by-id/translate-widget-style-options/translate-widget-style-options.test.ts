import cloneDeep from 'lodash-es/cloneDeep';
import merge from 'lodash-es/merge';
import { describe } from 'vitest';

import {
  AreaStyleOptions,
  BaseAxisStyleOptions,
  CalendarHeatmapStyleOptions,
  FunnelStyleOptions,
  LineStyleOptions,
  StackableStyleOptions,
  TableStyleOptions,
} from '@/types.js';

import { jaqlMock } from '../__mocks__/jaql-mock.js';
import {
  CalendarHeatmapWidgetStyle,
  CartesianWidgetStyle,
  FunnelWidgetStyle,
  IndicatorWidgetStyle,
  PanelItem,
  PolarWidgetStyle,
  ScatterWidgetStyle,
  TreemapWidgetStyle,
  WidgetDto,
  WidgetSubtype,
} from '../types.js';
import {
  extractStyleOptions,
  getIndicatorTypeSpecificOptions,
} from './translate-widget-style-options.js';

type BaseStyleOptionsWithAxes = StackableStyleOptions & BaseAxisStyleOptions;

function generateWidgetAxisOptions(options = {}) {
  const defaultOptions = {
    enabled: true,
    title: {
      enabled: true,
    },
    labels: {
      enabled: true,
    },
    isIntervalEnabled: true,
    intervalJumps: 1,
    logarithmic: false,
    gridLines: true,
  };

  return merge(cloneDeep(defaultOptions), options);
}

const mockWidgetDto = (subtype: WidgetSubtype | string, style: any, panels: any): WidgetDto => {
  return {
    subtype,
    style,
    metadata: {
      panels,
    },
  } as WidgetDto;
};

describe('translate widget style options', () => {
  describe('axes style options for cartesian chart', () => {
    const widgetPanels = [
      {
        name: 'categories',
        items: [
          {
            jaql: jaqlMock.category,
          },
          {
            jaql: jaqlMock.ageRange,
          },
        ],
      },
      {
        name: 'values',
        items: [
          {
            jaql: jaqlMock.costAggregated,
          },
          {
            jaql: jaqlMock.formula,
            y2: true,
          },
        ],
      },
    ];

    it('should prepare correct axes options', () => {
      const widgetStyle = {
        xAxis: generateWidgetAxisOptions({
          title: {
            text: 'xAxis title',
          },
          x2Title: {
            enabled: true,
            text: 'x2Axis title',
          },
          min: 100,
          max: 1000,
        }),
        yAxis: generateWidgetAxisOptions({
          title: {
            text: 'yAxis title',
          },
          // any non-number value of 'min/max' options should be transformed into 'null'
          min: true,
          max: 'some text value',
        }),
        y2Axis: generateWidgetAxisOptions({ title: { text: 'y2Axis title' } }),
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('', widgetStyle, widgetPanels),
      ) as BaseStyleOptionsWithAxes;

      expect(styleOptions.xAxis).toEqual({
        ...widgetStyle.xAxis,
        title: widgetStyle.xAxis?.x2Title,
        x2Title: widgetStyle.xAxis?.title,
      });
      expect(styleOptions.yAxis).toEqual({ ...widgetStyle.yAxis, min: undefined, max: undefined });
      expect(styleOptions.y2Axis).toEqual(widgetStyle.y2Axis);
    });

    it('should prepare axes options with default titles taken from panels', () => {
      const widgetStyle = {
        xAxis: generateWidgetAxisOptions(),
        yAxis: generateWidgetAxisOptions(),
        y2Axis: generateWidgetAxisOptions(),
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('', widgetStyle, widgetPanels),
      ) as BaseStyleOptionsWithAxes;

      expect(styleOptions.xAxis?.title?.text).toEqual(widgetPanels[0].items[1].jaql.title);
      expect(styleOptions.xAxis?.x2Title?.text).toEqual(widgetPanels[0].items[0].jaql.title);
      expect(styleOptions.yAxis?.title?.text).toEqual(widgetPanels[1].items[0].jaql.title);
      expect(styleOptions.y2Axis?.title?.text).toEqual(widgetPanels[1].items[1].jaql.title);
    });

    it('should prepare correct markers options', () => {
      const widgetStyle = {
        markers: { enabled: true, size: 10, fill: 'red' },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/area',
        mockWidgetDto('', widgetStyle, []),
      ) as AreaStyleOptions;

      expect(styleOptions.markers).toEqual(widgetStyle.markers);
    });

    it('should prepare correct lineWidth options', () => {
      const widgetStyle = {
        lineWidth: { width: '10px' },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/area',
        mockWidgetDto('', widgetStyle, []),
      ) as AreaStyleOptions;

      expect(styleOptions.lineWidth).toEqual(widgetStyle.lineWidth);
    });

    it('should map Fusion lineWidth.customWidth to styleOptions.line.width', () => {
      const widgetStyle = {
        lineWidth: { width: 'bold', customWidth: 7 },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.lineWidth).toEqual({ width: 'bold' });
      expect(styleOptions.line).toEqual({ width: 7 });
    });

    it('should omit styleOptions.line.width when Fusion lineWidth.customWidth is zero', () => {
      const widgetStyle = {
        lineWidth: { width: 'bold', customWidth: 0 },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.lineWidth).toEqual({ width: 'bold' });
      expect(styleOptions.line).toBeUndefined();
    });

    it('should map Fusion seriesLabels.customRotation to styleOptions.seriesLabels.rotation', () => {
      const widgetStyle = {
        seriesLabels: { enabled: true, rotation: 0, customRotation: 67 },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.rotation).toBe(67);
    });

    it('should map Fusion seriesLabels prefix and suffix to styleOptions.seriesLabels', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          prefix: 'y',
          suffix: 'K',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.prefix).toBe('y');
      expect(styleOptions.seriesLabels?.suffix).toBe('K');
    });

    it('should map Fusion seriesLabels backgroundColor to styleOptions.seriesLabels', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          backgroundColor: '#00bcd4',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.backgroundColor).toBe('#00bcd4');
      expect(styleOptions.seriesLabels?.padding).toBeUndefined();
    });

    it('should map Fusion seriesLabels color to styleOptions.seriesLabels.textStyle', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          color: '#123456',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.textStyle).toEqual({ color: '#123456' });
    });

    it('should map Fusion seriesLabels fontSize to styleOptions.seriesLabels.textStyle', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          fontSize: 16,
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.textStyle).toEqual({ fontSize: '16px' });
    });

    it('should map Fusion seriesLabels fontStyle to styleOptions.seriesLabels.textStyle', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          fontStyle: 'italic',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.textStyle).toEqual({ fontStyle: 'italic' });
    });

    it('should map Fusion seriesLabels fontStyle normal to clear sticky italic in textStyle', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          fontStyle: 'normal',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.textStyle).toEqual({ fontStyle: 'normal' });
    });

    it('should preserve seriesLabels fontSize and fontStyle when Fusion color is explicitly cleared', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          color: null,
          fontSize: 16,
          fontStyle: 'italic',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.textStyle).toEqual({
        fontSize: '16px',
        fontStyle: 'italic',
      });
    });

    it('should map Fusion legend color to styleOptions.legend.items.textStyle', () => {
      const widgetStyle = {
        legend: {
          enabled: true,
          position: 'left',
          color: '#00ff00',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.legend?.items?.textStyle).toEqual({ color: '#00ff00' });
    });

    it('should map Fusion legend fontSize and fontStyle to styleOptions.legend.items.textStyle', () => {
      const widgetStyle = {
        legend: {
          enabled: true,
          position: 'bottom',
          fontSize: 16,
          fontStyle: 'italic',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/funnel',
        mockWidgetDto('', widgetStyle, []),
      ) as FunnelStyleOptions;

      expect(styleOptions.legend?.items?.textStyle).toEqual({
        fontSize: '16px',
        fontStyle: 'italic',
      });
    });

    it('should preserve legend fontSize and fontStyle when Fusion color is explicitly cleared', () => {
      const widgetStyle = {
        legend: {
          enabled: true,
          position: 'bottom',
          color: null,
          fontSize: 16,
          fontStyle: 'italic',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/funnel',
        mockWidgetDto('', widgetStyle, []),
      ) as FunnelStyleOptions;

      expect(styleOptions.legend?.items?.textStyle).toEqual({
        fontSize: '16px',
        fontStyle: 'italic',
      });
    });

    it('should omit legend textStyle when Fusion color is explicitly cleared with no font fields', () => {
      const widgetStyle = {
        legend: {
          enabled: true,
          position: 'bottom',
          color: null,
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/funnel',
        mockWidgetDto('', widgetStyle, []),
      ) as FunnelStyleOptions;

      expect(styleOptions.legend?.items?.textStyle).toBeUndefined();
    });

    it('should map Fusion seriesLabels backgroundPadding when backgroundColor is set', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          backgroundColor: '#00bcd4',
          backgroundPadding: 6,
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.padding).toBe(6);
    });

    it('should map Fusion seriesLabels borderColor to styleOptions.seriesLabels', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          borderColor: '#333333',
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.borderColor).toBe('#333333');
      expect(styleOptions.seriesLabels?.borderWidth).toBeUndefined();
      expect(styleOptions.seriesLabels?.borderRadius).toBeUndefined();
    });

    it('should map Fusion seriesLabels borderWidth and borderRadius when borderColor is set', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          borderColor: '#333333',
          borderWidth: 3,
          borderRadius: 4,
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.borderWidth).toBe(3);
      expect(styleOptions.seriesLabels?.borderRadius).toBe(4);
    });

    it('should map Fusion seriesLabels xOffset and yOffset to styleOptions.seriesLabels', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          xOffset: -4,
          yOffset: 6,
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.xOffset).toBe(-4);
      expect(styleOptions.seriesLabels?.yOffset).toBe(6);
    });

    it('should omit zero Fusion seriesLabels offsets from styleOptions.seriesLabels', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 0,
          xOffset: 0,
          yOffset: 0,
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.seriesLabels?.xOffset).toBeUndefined();
      expect(styleOptions.seriesLabels?.yOffset).toBeUndefined();
    });

    it('should prepare correct line dashStyle from style.line', () => {
      const widgetStyle = {
        line: { dashStyle: 'ShortDash' },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.line).toEqual({ dashStyle: 'ShortDash' });
    });

    it('should ignore invalid Fusion line.dashStyle strings', () => {
      const widgetStyle = {
        line: { dashStyle: 'NotARealDashStyle' },
      } as unknown as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.line).toBeUndefined();
    });

    it('should map Fusion lineStyle.lineType to styleOptions.line.dashStyle', () => {
      const widgetStyle = {
        lineStyle: { lineType: 'dotted' },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/area',
        mockWidgetDto('', widgetStyle, []),
      ) as AreaStyleOptions;

      expect(styleOptions.line).toEqual({ dashStyle: 'ShortDot' });
    });

    it('should map extended Fusion lineStyle.lineType tokens to dashStyle', () => {
      const widgetStyle = {
        lineStyle: { lineType: 'longDashDotDot' },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/line',
        mockWidgetDto('', widgetStyle, []),
      ) as LineStyleOptions;

      expect(styleOptions.line).toEqual({ dashStyle: 'LongDashDotDot' });
    });
  });

  describe('axes style options for polar chart', () => {
    const widgetPanels = [
      {
        name: 'categories',
        items: [
          {
            jaql: jaqlMock.category,
          },
        ],
      },
    ];

    it('should prepare correct axes options', () => {
      const widgetStyle = {
        categories: generateWidgetAxisOptions({
          title: {
            text: 'xAxis title',
          },
        }),
        axis: generateWidgetAxisOptions(),
      } as PolarWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/polar',
        mockWidgetDto('', widgetStyle, widgetPanels),
      ) as BaseStyleOptionsWithAxes;

      expect(styleOptions.xAxis).toEqual(widgetStyle.categories);
      expect(styleOptions.yAxis).toEqual({
        ...widgetStyle.axis,
        title: {
          ...widgetStyle.axis?.title,
          enabled: false,
        },
      });
    });

    it('should prepare axes options with default titles taken from panels', () => {
      const widgetStyle = {
        categories: generateWidgetAxisOptions(),
        axis: generateWidgetAxisOptions(),
      } as PolarWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/polar',
        mockWidgetDto('', widgetStyle, widgetPanels),
      ) as BaseStyleOptionsWithAxes;

      expect(styleOptions.xAxis?.title?.text).toEqual(widgetPanels[0].items[0].jaql.title);
    });
  });

  describe('axes style options for scatter chart', () => {
    const widgetPanels = [
      {
        name: 'x-axis',
        items: [
          {
            jaql: jaqlMock.category,
          },
        ],
      },
      {
        name: 'y-axis',
        items: [
          {
            jaql: jaqlMock.costAggregated,
          },
        ],
      },
    ];

    it('should prepare correct axes options', () => {
      const widgetStyle = {
        xAxis: generateWidgetAxisOptions({ title: { text: 'xAxis title' } }),
        yAxis: generateWidgetAxisOptions({ title: { text: 'yAxis title' } }),
      } as ScatterWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/scatter',
        mockWidgetDto('', widgetStyle, widgetPanels),
      ) as BaseStyleOptionsWithAxes;

      expect(styleOptions.xAxis).toEqual(widgetStyle.xAxis);
      expect(styleOptions.yAxis).toEqual(widgetStyle.yAxis);
    });

    it('should prepare axes options with default titles taken from panels', () => {
      const widgetStyle = {
        xAxis: generateWidgetAxisOptions(),
        yAxis: generateWidgetAxisOptions(),
      } as ScatterWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/scatter',
        mockWidgetDto('', widgetStyle, widgetPanels),
      ) as BaseStyleOptionsWithAxes;

      expect(styleOptions.xAxis?.title?.text).toEqual(widgetPanels[0].items[0].jaql.title);
      expect(styleOptions.yAxis?.title?.text).toEqual(widgetPanels[1].items[0].jaql.title);
    });
  });

  describe('style options for funnel chart', () => {
    it('should prepare correct style options', () => {
      const widgetStyle = {
        size: 'regular',
        type: 'regular',
        direction: 'regular',
        legend: {
          enabled: true,
          position: 'bottom',
        },
        labels: {
          enabled: true,
          categories: true,
          percent: true,
          value: true,
          decimals: true,
        },
      } as FunnelWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/funnel',
        mockWidgetDto('', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions).toEqual({
        // Only extract supported properties, not all widget style properties
        legend: widgetStyle.legend,
        navigator: widgetStyle.navigator,
        funnelSize: widgetStyle.size,
        funnelType: widgetStyle.type,
        funnelDirection: widgetStyle.direction,
        labels: widgetStyle.labels,
        seriesLabels: {
          enabled: true,
          showCategory: true,
          showValue: true,
          showPercentage: true,
          showPercentDecimals: true,
          rotation: 0,
        },
      });
    });

    it('should map Fusion labels formatting to styleOptions.seriesLabels', () => {
      const widgetStyle = {
        size: 'regular',
        type: 'regular',
        direction: 'regular',
        labels: {
          enabled: true,
          categories: true,
          percent: true,
          value: true,
          decimals: false,
          customRotation: 30,
          prefix: 'A',
          suffix: 'B',
          backgroundColor: '#ff0000',
          backgroundPadding: 4,
          borderColor: '#111111',
          borderWidth: 2,
          borderRadius: 3,
          xOffset: 5,
          yOffset: -1,
        },
      } as FunnelWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/funnel',
        mockWidgetDto('', widgetStyle, []),
      ) as FunnelStyleOptions;

      expect(styleOptions.seriesLabels).toMatchObject({
        rotation: 30,
        prefix: 'A',
        suffix: 'B',
        backgroundColor: '#ff0000',
        padding: 4,
        borderColor: '#111111',
        borderWidth: 2,
        borderRadius: 3,
        xOffset: 5,
        yOffset: -1,
      });
    });

    it('should clear seriesLabels colors when Fusion labels colors are null', () => {
      const widgetStyle = {
        size: 'regular',
        type: 'regular',
        direction: 'regular',
        labels: {
          enabled: true,
          categories: true,
          percent: true,
          value: true,
          decimals: false,
          backgroundColor: null,
          borderColor: null,
        },
      } as FunnelWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/funnel',
        mockWidgetDto('', widgetStyle, []),
      ) as FunnelStyleOptions;

      expect(styleOptions.seriesLabels).not.toHaveProperty('backgroundColor');
      expect(styleOptions.seriesLabels).not.toHaveProperty('padding');
      expect(styleOptions.seriesLabels).not.toHaveProperty('borderColor');
      expect(styleOptions.seriesLabels).not.toHaveProperty('borderWidth');
      expect(styleOptions.seriesLabels).not.toHaveProperty('borderRadius');
    });
  });

  describe('labels style for cartesian chart', () => {
    it('should prepare correct labels options - base case', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 45,
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 45,
        showPercentage: false,
        showValue: true,
      });
    });
    it('should prepare correct labels options - base case with redundant types', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 45,
          labels: {
            types: {
              count: false,
              relative: false,
              totals: false,
            },
          },
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 45,
        showPercentage: false,
        showValue: true,
      });
    });

    it('should prepare correct labels options - stacked with value', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 45,
          labels: {
            types: {
              count: false,
              relative: true,
              totals: false,
            },
          },
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('column/stackedcolumn', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 45,
        showPercentage: false,
        showValue: true,
      });
    });

    it('should prepare correct labels options - stacked without value', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 90,
          labels: {
            types: {
              count: false,
              relative: false,
              totals: false,
            },
          },
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('column/stackedcolumn', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 90,
        showPercentage: false,
        showValue: false,
      });
    });

    it('should prepare correct labels options - stacked with totals', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 45,
          labels: {
            types: {
              count: false,
              relative: false,
              totals: true,
            },
          },
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('column/stackedcolumn', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 45,
        showPercentage: false,
        showValue: false,
      });
      expect(styleOptions.totalLabels).toEqual({
        enabled: true,
        rotation: 45,
      });
    });

    it('should prepare correct labels options - stacked 100 with percentage', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 90,
          labels: {
            types: {
              percentage: true,
              count: false,
              relative: false,
              totals: false,
            },
          },
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('column/stackedcolumn100', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 90,
        showPercentage: true,
        showValue: false,
      });
    });

    it('should prepare correct labels options - stacked 100 with value', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 90,
          labels: {
            types: {
              count: true,
              relative: false,
              totals: false,
            },
          },
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('column/stackedcolumn100', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 90,
        showPercentage: false,
        showValue: true,
      });
    });

    it('should prepare correct labels options - stacked 100 with value, percentage and totals', () => {
      const widgetStyle = {
        seriesLabels: {
          enabled: true,
          rotation: 45,
          labels: {
            types: {
              percentage: true,
              count: true,
              relative: false,
              totals: true,
            },
          },
        },
      } as CartesianWidgetStyle;

      const styleOptions = extractStyleOptions(
        'chart/column',
        mockWidgetDto('column/stackedcolumn100', widgetStyle, []),
      ) as StackableStyleOptions;

      expect(styleOptions.seriesLabels).toEqual({
        enabled: true,
        rotation: 45,
        showPercentage: true,
        showValue: true,
      });
      expect(styleOptions.totalLabels).toEqual({
        enabled: true,
        rotation: 45,
      });
    });
  });

  describe('style options for table chart', () => {
    it('should extract table chart style options correctly', () => {
      const widgetStyle = {
        'colors/columns': true,
        'colors/rows': false,
        'colors/headers': true,
      };

      const expectedOptions = {
        columns: { alternatingColor: { enabled: true }, width: undefined },
        rows: { alternatingColor: { enabled: false } },
        header: { color: { enabled: true } },
        rowsPerPage: undefined,
        // Fusion treats a missing `automaticHeight` as enabled.
        isAutoHeight: true,
      };

      expect(extractStyleOptions('tablewidget', mockWidgetDto('', widgetStyle, []))).toEqual(
        expectedOptions,
      );
      expect(extractStyleOptions('tablewidgetagg', mockWidgetDto('', widgetStyle, []))).toEqual(
        expectedOptions,
      );
    });

    it.each([
      { automaticHeight: true, expected: true },
      { automaticHeight: false, expected: false },
      { automaticHeight: undefined, expected: true },
    ])(
      'maps automaticHeight $automaticHeight to isAutoHeight $expected',
      ({ automaticHeight, expected }) => {
        const widgetStyle = { 'colors/headers': true, automaticHeight };

        const styleOptions = extractStyleOptions(
          'tablewidget',
          mockWidgetDto('', widgetStyle, []),
        ) as TableStyleOptions;

        expect(styleOptions.isAutoHeight).toBe(expected);
      },
    );
    it('should extract table column auto width correctly', () => {
      const widgetStyleAutoWidth = {
        'width/window': true,
        'width/content': false,
      };

      const widgetStyleContentWidth = {
        'width/window': false,
        'width/content': true,
      };

      expect(
        extractStyleOptions('tablewidget', mockWidgetDto('', widgetStyleAutoWidth, [])),
      ).toMatchObject({
        columns: { alternatingColor: { enabled: undefined }, width: 'auto' },
      });

      expect(
        extractStyleOptions('tablewidget', mockWidgetDto('', widgetStyleContentWidth, [])),
      ).toMatchObject({
        columns: { alternatingColor: { enabled: undefined }, width: 'content' },
      });

      expect(extractStyleOptions('tablewidget', mockWidgetDto('', {}, []))).toMatchObject({
        columns: { alternatingColor: { enabled: undefined }, width: undefined },
      });
    });
  });

  describe('style options for indicator chart', () => {
    it('should prepare correct style options', () => {
      const widgetStyle = {
        skin: 'vertical',
        components: {
          title: {
            enabled: true,
          },
          ticks: {
            enabled: true,
          },
          labels: {
            enabled: true,
          },
        },
      } as IndicatorWidgetStyle;

      const styleOptions = extractStyleOptions(
        'indicator',
        mockWidgetDto('indicator/numeric', widgetStyle, [
          {
            name: 'value',
            items: [
              {
                jaql: {
                  title: 'Test',
                },
              } as PanelItem,
            ],
          },
          {
            name: 'secondary',
            items: [
              {
                jaql: {
                  title: 'Test 2',
                },
              } as PanelItem,
            ],
          },
        ]),
      ) as StackableStyleOptions;

      expect(styleOptions).toStrictEqual({
        indicatorComponents: {
          labels: {
            shouldBeShown: true,
          },
          secondaryTitle: {
            text: 'Test 2',
          },
          ticks: {
            shouldBeShown: true,
          },
          title: {
            shouldBeShown: true,
            text: 'Test',
          },
        },
        numericSubtype: 'numericSimple',
        subtype: 'indicator/numeric',
        skin: 'vertical',
      });
    });
  });

  describe('getIndicatorTypeSpecificOptions', () => {
    it('should prepare correct indicator type specific options - case 1', () => {
      const widgetSubtype = 'indicator/numeric';
      const widgetStyle = {
        subtype: 'simple',
        skin: 'vertical',
      };
      const expectedResult = {
        subtype: widgetSubtype,
        numericSubtype: 'numericSimple',
        skin: 'vertical',
      };

      expect(
        getIndicatorTypeSpecificOptions(widgetSubtype, widgetStyle as IndicatorWidgetStyle),
      ).toStrictEqual(expectedResult);
    });

    it('should prepare correct indicator type specific options - case 2', () => {
      const widgetSubtype = 'indicator/numeric';
      const widgetStyle = {
        subtype: 'bar',
        skin: 'vertical',
      };
      const expectedResult = {
        subtype: widgetSubtype,
        numericSubtype: 'numericBar',
      };

      expect(
        getIndicatorTypeSpecificOptions(widgetSubtype, widgetStyle as IndicatorWidgetStyle),
      ).toStrictEqual(expectedResult);
    });

    it('should prepare correct indicator type specific options - case 3', () => {
      const widgetSubtype = 'indicator/gauge';
      const widgetStyle = {
        skin: '1',
      };
      const expectedResult = {
        subtype: widgetSubtype,
        skin: 1,
      };

      expect(
        getIndicatorTypeSpecificOptions(widgetSubtype, widgetStyle as IndicatorWidgetStyle),
      ).toStrictEqual(expectedResult);
    });
  });

  describe('should prepare correct treemap style options', () => {
    it('case 1 - default', () => {
      const widgetStyle = {
        'title/1': true,
        'title/2': true,
        'title/3': true,
        'tooltip/value': true,
      } as TreemapWidgetStyle;

      const expected = {
        labels: {
          category: [{ enabled: true }, { enabled: true }, { enabled: true }],
        },
        tooltip: {
          mode: 'value',
        },
      };
      const result = extractStyleOptions('treemap', mockWidgetDto('treemap', widgetStyle, []));

      expect(result).toEqual(expected);
    });

    it('case 2 - disabled labels and contribution mode', () => {
      const widgetStyle = {
        'title/1': false,
        'title/2': false,
        'title/3': false,
        'tooltip/value': false,
      } as TreemapWidgetStyle;

      const expected = {
        labels: {
          category: [{ enabled: false }, { enabled: false }, { enabled: false }],
        },
        tooltip: {
          mode: 'contribution',
        },
      };
      const result = extractStyleOptions('treemap', mockWidgetDto('treemap', widgetStyle, []));

      expect(result).toEqual(expected);
    });

    it('case 3 - empty widget style', () => {
      const widgetStyle = {} as TreemapWidgetStyle;

      const expected = {
        labels: {
          category: [{ enabled: true }, { enabled: true }, { enabled: true }],
        },
        tooltip: {
          mode: 'value',
        },
      };
      const result = extractStyleOptions('treemap', mockWidgetDto('treemap', widgetStyle, []));

      expect(result).toEqual(expected);
    });
  });

  describe('extractStyleOptions for CalendarHeatmapChart', () => {
    const mockCalendarHeatmapWidgetDto = (style: CalendarHeatmapWidgetStyle): WidgetDto => {
      return {
        oid: 'test-widget-id',
        type: 'heatmap',
        subtype: 'heatmap',
        title: 'Test Calendar Heatmap',
        desc: 'Test description',
        datasource: { title: 'Test DataSource', live: false },
        style,
        metadata: {
          panels: [],
        },
      } as WidgetDto;
    };

    it('should extract calendar heatmap style options with startMonth', () => {
      const widgetStyle: CalendarHeatmapWidgetStyle = {
        dayNameEnabled: true,
        dayNumberEnabled: false,
        'domain/quarter': true,
        'week/monday': true,
        grayoutEnabled: true,
        startMonth: {
          year: 2023,
          month: 6, // July (0-based, where 6 = July)
        },
      };

      const result = extractStyleOptions(
        'heatmap',
        mockCalendarHeatmapWidgetDto(widgetStyle),
      ) as CalendarHeatmapStyleOptions;

      expect(result.viewType).toBe('quarter');
      expect(result.startOfWeek).toBe('monday');
      expect(result.cellLabels?.enabled).toBe(false);
      expect(result.dayLabels?.enabled).toBe(true);
      expect(result.weekends?.days).toEqual(['saturday', 'sunday']);
      expect(result.pagination?.enabled).toBe(true);
      expect(result.pagination?.startMonth).toEqual(new Date(2023, 6, 1)); // July 1st, 2023 (month 6 = July in 0-based)
    });

    it('should extract calendar heatmap style options without startMonth', () => {
      const widgetStyle: CalendarHeatmapWidgetStyle = {
        dayNameEnabled: false,
        dayNumberEnabled: true,
        'domain/year': true,
        'week/sunday': true,
        grayoutEnabled: false,
      };

      const result = extractStyleOptions(
        'heatmap',
        mockCalendarHeatmapWidgetDto(widgetStyle),
      ) as CalendarHeatmapStyleOptions;

      expect(result.viewType).toBe('year');
      expect(result.startOfWeek).toBe('sunday');
      expect(result.cellLabels?.enabled).toBe(true);
      expect(result.dayLabels?.enabled).toBe(false);
      expect(result.weekends?.days).toEqual([]);
      expect(result.pagination?.enabled).toBe(true);
      expect(result.pagination?.startMonth).toBeUndefined();
    });

    it('should handle edge case with startMonth at year boundary', () => {
      const widgetStyle: CalendarHeatmapWidgetStyle = {
        startMonth: {
          year: 2024,
          month: 1, // February (0-based, where 1 = February)
        },
      };

      const result = extractStyleOptions(
        'heatmap',
        mockCalendarHeatmapWidgetDto(widgetStyle),
      ) as CalendarHeatmapStyleOptions;

      expect(result.pagination?.startMonth).toEqual(new Date(2024, 1, 1)); // February 1st, 2024
    });

    it('should handle edge case with startMonth at December', () => {
      const widgetStyle: CalendarHeatmapWidgetStyle = {
        startMonth: {
          year: 2023,
          month: 12, // January of next year (0-based, where 12 = January of next year)
        },
      };

      const result = extractStyleOptions(
        'heatmap',
        mockCalendarHeatmapWidgetDto(widgetStyle),
      ) as CalendarHeatmapStyleOptions;

      expect(result.pagination?.startMonth).toEqual(new Date(2024, 0, 1)); // January 1st, 2024 (month 12 wraps to next year)
    });

    it('should handle startMonth as object', () => {
      const widgetStyle: CalendarHeatmapWidgetStyle = {
        startMonth: {
          year: 2023,
          month: 0, // January (0-based)
        },
      };

      const result = extractStyleOptions(
        'heatmap',
        mockCalendarHeatmapWidgetDto(widgetStyle),
      ) as CalendarHeatmapStyleOptions;

      expect(result.pagination?.startMonth).toEqual(new Date(2023, 0, 1)); // January 1st, 2023
    });

    it('should handle startMonth as string', () => {
      const widgetStyle = {
        startMonth: '2023-06-15',
      };

      const result = extractStyleOptions(
        'heatmap',
        mockCalendarHeatmapWidgetDto(widgetStyle),
      ) as CalendarHeatmapStyleOptions;

      expect(result.pagination?.startMonth).toEqual(new Date('2023-06-15'));
      expect(result.pagination?.startMonth?.getFullYear()).toBe(2023);
      expect(result.pagination?.startMonth?.getMonth()).toBe(5); // June (0-based)
    });
  });
});
