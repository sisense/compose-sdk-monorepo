/* eslint-disable max-params */
/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { TranslatableError } from '../translation/translatable-error';
import {
  StyleOptions,
  LineStyleOptions,
  AreaStyleOptions,
  StackableStyleOptions,
  AxisLabel,
  PolarStyleOptions,
  ScatterStyleOptions,
  FunnelStyleOptions,
  TableStyleOptions,
  IndicatorStyleOptions,
  NumericBarIndicatorStyleOptions,
  NumericSimpleIndicatorStyleOptions,
  GaugeIndicatorStyleOptions,
  TreemapStyleOptions,
  BaseAxisStyleOptions,
  SunburstStyleOptions,
} from '../types';
import {
  Panel,
  WidgetStyle,
  WidgetSubtype,
  WidgetType,
  CartesianWidgetStyle,
  PolarWidgetStyle,
  FunnelWidgetStyle,
  ScatterWidgetStyle,
  TableWidgetStyle,
  IndicatorWidgetStyle,
  TreemapWidgetStyle,
  AxisStyle,
  SunburstWidgetStyle,
} from './types';
import { getEnabledPanelItems, getChartSubtype } from './utils';

function extractBaseStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: WidgetStyle,
): StyleOptions {
  const chartSubtype = getChartSubtype(widgetSubtype);
  return {
    ...widgetStyle,
    ...(chartSubtype && { subtype: chartSubtype }),
  } as StyleOptions;
}

function extractAxisStyleOptions(widgetAxisStyleOptions?: AxisStyle) {
  const { min, max } = widgetAxisStyleOptions || {};
  return {
    ...widgetAxisStyleOptions,
    min: typeof min == 'number' ? min : null,
    max: typeof max == 'number' ? max : null,
  };
}

type AxisStyleOptions = Pick<BaseAxisStyleOptions, 'xAxis' | 'yAxis' | 'y2Axis'>;

function prepareCartesianChartAxisOptions(
  widgetType: WidgetType,
  widgetStyle: CartesianWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.xAxis),
    yAxis: extractAxisStyleOptions(widgetStyle.yAxis),
    y2Axis: extractAxisStyleOptions(widgetStyle.y2Axis),
  } as AxisStyleOptions;
  const widgetTypesWithXAxis: WidgetType[] = ['chart/line', 'chart/area'];
  const xAxesRelatedPanelName = widgetTypesWithXAxis.includes(widgetType) ? 'x-axis' : 'categories';
  const xAxesRelatedPanelItems = getEnabledPanelItems(panels, xAxesRelatedPanelName);
  const yAxesRelatedPanelItems = getEnabledPanelItems(panels, 'values');
  const hasX2Axis = xAxesRelatedPanelItems.length === 2;

  if (hasX2Axis) {
    // Notes: Swap 'title' and 'x2Title' options since, in the current widget model, 'title' represents the top axis
    // while 'x2Title' represents the bottom axis, which contradicts our interface.
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      title: axisOptions.xAxis?.x2Title,
      x2Title: axisOptions.xAxis?.title,
    } as AxisLabel;
  }

  const hasXAxisTitleText = !!(axisOptions.xAxis?.title && 'text' in axisOptions.xAxis.title);
  const xAxisRelatedPanelItem = xAxesRelatedPanelItems[xAxesRelatedPanelItems.length - 1];
  if (!hasXAxisTitleText && xAxisRelatedPanelItem) {
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      title: {
        ...axisOptions.xAxis?.title,
        text: xAxisRelatedPanelItem.jaql.title,
      },
    } as AxisLabel;
  }

  const hasX2AxisTitleText = !!(axisOptions.xAxis?.x2Title && 'text' in axisOptions.xAxis.x2Title);
  const x2AxisRelatedPanelItem = xAxesRelatedPanelItems[0];
  if (!hasX2AxisTitleText && hasX2Axis) {
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      x2Title: {
        ...axisOptions.xAxis?.x2Title,
        text: x2AxisRelatedPanelItem.jaql.title,
      },
    } as AxisLabel;
  }
  const hasYAxisTitleText = !!(axisOptions.yAxis?.title && 'text' in axisOptions.yAxis.title);
  const yAxisRelatedPanelItems = yAxesRelatedPanelItems.filter((item) => !item.y2);
  if (!hasYAxisTitleText && yAxisRelatedPanelItems.length === 1) {
    axisOptions.yAxis = {
      ...axisOptions.yAxis,
      title: {
        ...axisOptions.yAxis?.title,
        text: yAxisRelatedPanelItems[0].jaql.title,
      },
    } as AxisLabel;
  }

  const hasY2AxisTitleText = !!(axisOptions.y2Axis?.title && 'text' in axisOptions.y2Axis.title);
  const y2AxisRelatedPanelItems = yAxesRelatedPanelItems.filter((item) => item.y2);
  if (!hasY2AxisTitleText && y2AxisRelatedPanelItems.length === 1) {
    axisOptions.y2Axis = {
      ...axisOptions.y2Axis,
      title: {
        ...axisOptions.y2Axis?.title,
        text: y2AxisRelatedPanelItems[0].jaql.title,
      },
    } as AxisLabel;
  }

  return axisOptions;
}

function preparePolarChartAxisOptions(
  widgetStyle: PolarWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.categories),
    yAxis: extractAxisStyleOptions(widgetStyle.axis),
  } as AxisStyleOptions;
  const xAxisRelatedPanelItem = getEnabledPanelItems(panels, 'categories')[0];

  const hasXAxisTitleText = !!(axisOptions.xAxis?.title && 'text' in axisOptions.xAxis.title);
  if (!hasXAxisTitleText && xAxisRelatedPanelItem) {
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      title: {
        ...axisOptions.xAxis?.title,
        text: xAxisRelatedPanelItem.jaql.title,
      },
    } as AxisLabel;
  }

  axisOptions.yAxis = {
    ...axisOptions.yAxis,
    title: {
      enabled: false,
    },
  } as AxisLabel;

  return axisOptions;
}

function prepareScatterChartAxisOptions(
  widgetStyle: ScatterWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.xAxis),
    yAxis: extractAxisStyleOptions(widgetStyle.yAxis),
  } as AxisStyleOptions;
  const xAxisRelatedPanelItem = getEnabledPanelItems(panels, 'x-axis')[0];
  const yAxisRelatedPanelItems = getEnabledPanelItems(panels, 'y-axis')[0];

  const hasXAxisTitleText = !!(axisOptions.xAxis?.title && 'text' in axisOptions.xAxis.title);
  if (!hasXAxisTitleText && xAxisRelatedPanelItem) {
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      title: {
        ...axisOptions.xAxis?.title,
        text: xAxisRelatedPanelItem.jaql.title,
      },
    } as AxisLabel;
  }

  const hasYAxisTitleText = !!(axisOptions.yAxis?.title && 'text' in axisOptions.yAxis.title);
  if (!hasYAxisTitleText && yAxisRelatedPanelItems) {
    axisOptions.yAxis = {
      ...axisOptions.yAxis,
      title: {
        ...axisOptions.yAxis?.title,
        text: yAxisRelatedPanelItems.jaql.title,
      },
    } as AxisLabel;
  }

  return axisOptions;
}

type CartesianChartStyleOptions = LineStyleOptions | AreaStyleOptions | StackableStyleOptions;

function extractCartesianChartStyleOptions(
  widgetType: WidgetType,
  widgetSubtype: WidgetSubtype,
  widgetStyle: CartesianWidgetStyle,
  panels: Panel[],
): CartesianChartStyleOptions {
  return {
    ...extractBaseStyleOptions(widgetSubtype, widgetStyle),
    ...prepareCartesianChartAxisOptions(widgetType, widgetStyle, panels),
    lineWidth: widgetStyle.lineWidth,
    markers: widgetStyle.markers,
  } as CartesianChartStyleOptions;
}

function extractPolarChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: PolarWidgetStyle,
  panels: Panel[],
): PolarStyleOptions {
  return {
    ...extractBaseStyleOptions(widgetSubtype, widgetStyle),
    ...preparePolarChartAxisOptions(widgetStyle, panels),
  } as PolarStyleOptions;
}

function extractScatterChartDataOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: ScatterWidgetStyle,
  panels: Panel[],
): ScatterStyleOptions {
  return {
    ...extractBaseStyleOptions(widgetSubtype, widgetStyle),
    ...prepareScatterChartAxisOptions(widgetStyle, panels),
    markerSize: {
      scatterDefaultSize: widgetStyle.markerSize?.defaultSize,
      scatterBubbleMinSize: widgetStyle.markerSize?.min,
      scatterBubbleMaxSize: widgetStyle.markerSize?.max,
    },
  } as ScatterStyleOptions;
}

export function extractTableChartStyleOptions(widgetStyle: TableWidgetStyle): TableStyleOptions {
  return {
    alternatingColumnsColor: widgetStyle['colors/columns'],
    alternatingRowsColor: widgetStyle['colors/rows'],
    headersColor: widgetStyle['colors/headers'],
  };
}

function extractFunnelChartDataOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: FunnelWidgetStyle,
): FunnelStyleOptions {
  return {
    ...extractBaseStyleOptions(widgetSubtype, widgetStyle),
    funnelSize: widgetStyle.size,
    funnelType: widgetStyle.type,
    funnelDirection: widgetStyle.direction,
    labels: widgetStyle.labels,
    legend: widgetStyle.legend,
  } as FunnelStyleOptions;
}

export const getIndicatorTypeSpecificOptions = (
  widgetSubtype: WidgetSubtype,
  widgetStyle: IndicatorWidgetStyle,
) => {
  const chartSubtype = getChartSubtype(widgetSubtype);

  if (chartSubtype === 'indicator/gauge') {
    return {
      subtype: chartSubtype,
      skin: +widgetStyle.skin,
    } as GaugeIndicatorStyleOptions;
  } else {
    if (widgetStyle.subtype === 'bar') {
      return {
        subtype: chartSubtype,
        numericSubtype: 'numericBar',
      } as NumericBarIndicatorStyleOptions;
    } else {
      return {
        subtype: chartSubtype,
        numericSubtype: 'numericSimple',
        skin: widgetStyle.skin,
      } as NumericSimpleIndicatorStyleOptions;
    }
  }
};

function extractIndicatorChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: IndicatorWidgetStyle,
  panels: Panel[],
): IndicatorStyleOptions {
  const indicatorTypeSpecificOptions = getIndicatorTypeSpecificOptions(widgetSubtype, widgetStyle);
  const title = getEnabledPanelItems(panels, 'value')[0]?.jaql.title;
  const secondaryTitle = getEnabledPanelItems(panels, 'secondary')[0]?.jaql.title;

  return {
    ...indicatorTypeSpecificOptions,
    indicatorComponents: {
      title: {
        shouldBeShown: widgetStyle.components?.title?.enabled || false,
        text: title,
      },
      secondaryTitle: {
        text: secondaryTitle || '',
      },
      ticks: {
        shouldBeShown: widgetStyle.components?.ticks?.enabled || false,
      },
      labels: {
        shouldBeShown: widgetStyle.components?.labels?.enabled || false,
      },
    },
  };
}

function extractTreemapChartStyleOptions(widgetStyle: TreemapWidgetStyle): TreemapStyleOptions {
  return {
    labels: {
      category: [
        { enabled: widgetStyle['title/1'] ?? true },
        { enabled: widgetStyle['title/2'] ?? true },
        { enabled: widgetStyle['title/3'] ?? true },
      ],
    },
    tooltip: {
      mode: widgetStyle['tooltip/value'] ?? true ? 'value' : 'contribution',
    },
  };
}

function extractSunburstChartStyleOptions(widgetStyle: SunburstWidgetStyle): SunburstStyleOptions {
  return {
    legend: {
      enabled: widgetStyle['legend/enabled'],
      position: widgetStyle['legend/position'],
    },
    tooltip: {
      mode: widgetStyle['tooltip/value'] ?? true ? 'value' : 'contribution',
    },
  };
}

export function extractStyleOptions<WType extends WidgetType>(
  widgetType: WType,
  widgetSubtype: WidgetSubtype,
  style: WidgetStyle,
  panels: Panel[],
): StyleOptions | TableStyleOptions {
  switch (widgetType) {
    case 'chart/line':
    case 'chart/area':
    case 'chart/bar':
    case 'chart/column':
      return extractCartesianChartStyleOptions(
        widgetType,
        widgetSubtype,
        style as CartesianWidgetStyle,
        panels,
      );
    case 'chart/polar':
      return extractPolarChartStyleOptions(widgetSubtype, style as PolarWidgetStyle, panels);
    case 'chart/scatter':
      return extractScatterChartDataOptions(widgetSubtype, style as ScatterWidgetStyle, panels);
    case 'chart/funnel':
      return extractFunnelChartDataOptions(widgetSubtype, style as FunnelWidgetStyle);
    case 'treemap':
      return extractTreemapChartStyleOptions(style as TreemapWidgetStyle);
    case 'sunburst':
      return extractSunburstChartStyleOptions(style as SunburstWidgetStyle);
    case 'chart/pie':
      return extractBaseStyleOptions(widgetSubtype, style);
    case 'tablewidget':
    case 'tablewidgetagg':
      return extractTableChartStyleOptions(style as TableWidgetStyle);
    case 'indicator':
      return extractIndicatorChartStyleOptions(
        widgetSubtype,
        style as IndicatorWidgetStyle,
        panels,
      );
    default:
      throw new TranslatableError('errors.unsupportedWidgetType', { widgetType });
  }
}
