import merge from 'lodash-es/merge';
import cloneDeep from 'lodash-es/cloneDeep';
import {
  extractStyleOptions,
  getIndicatorTypeSpecificOptions,
} from './translate-widget-style-options.js';
import { AreaStyleOptions, BaseAxisStyleOptions, BaseStyleOptions } from '../types.js';
import {
  CartesianWidgetStyle,
  FunnelWidgetStyle,
  IndicatorWidgetStyle,
  PanelItem,
  PolarWidgetStyle,
  ScatterWidgetStyle,
  TreemapWidgetStyle,
  WidgetDto,
  WidgetSubtype,
} from './types.js';
import { jaqlMock } from './__mocks__/jaql-mock.js';

type BaseStyleOptionsWithAxes = BaseStyleOptions & BaseAxisStyleOptions;

function generateWidgetAxisOptions(options = {}) {
  const defaultOptions = {
    enabled: true,
    title: {
      enabled: true,
    },
    labels: {
      enabled: true,
      rotation: 0,
    },
    gridLines: true,
    min: null,
    max: null,
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
      expect(styleOptions.yAxis).toEqual({ ...widgetStyle.yAxis, min: null, max: null });
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
      ) as BaseStyleOptions;

      expect(styleOptions).toEqual({
        ...widgetStyle,
        funnelSize: widgetStyle.size,
        funnelType: widgetStyle.type,
        funnelDirection: widgetStyle.direction,
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
        columns: { alternatingColor: { enabled: true } },
        rows: { alternatingColor: { enabled: false } },
        header: { color: { enabled: true } },
      };

      expect(extractStyleOptions('tablewidget', mockWidgetDto('', widgetStyle, []))).toEqual(
        expectedOptions,
      );
      expect(extractStyleOptions('tablewidgetagg', mockWidgetDto('', widgetStyle, []))).toEqual(
        expectedOptions,
      );
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
      ) as BaseStyleOptions;

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
});
