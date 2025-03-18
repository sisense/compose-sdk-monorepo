import { LEGACY_DESIGN_TYPES } from '../themes/legacy-design-settings';
/* eslint-disable max-params */
import { TranslatableError } from '../translation/translatable-error';
import {
  ChartStyleOptions,
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
  BoxplotStyleOptions,
  ScattermapStyleOptions,
  AreamapStyleOptions,
  AreamapType,
  PivotTableStyleOptions,
  SpaceSizes,
  RadiusSizes,
  ShadowsTypes,
  AlignmentTypes,
  WidgetStyleOptions,
  TextWidgetStyleOptions,
  CartesianStyleOptions,
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
  BoxplotWidgetStyle,
  ScattermapWidgetStyle,
  PivotWidgetStyle,
  WidgetDesign,
  WidgetDto,
  TextWidgetDtoStyle,
  isValidScrollerLocation,
} from './types';
import { getEnabledPanelItems, getChartSubtype } from './utils';

function extractBaseStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: WidgetStyle,
): ChartStyleOptions {
  const chartSubtype = getChartSubtype(widgetSubtype);
  return {
    ...widgetStyle,
    ...(chartSubtype && { subtype: chartSubtype }),
  } as ChartStyleOptions;
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

function prepareBoxplotChartAxisOptions(
  widgetStyle: BoxplotWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.xAxis),
    yAxis: extractAxisStyleOptions(widgetStyle.yAxis),
  } as AxisStyleOptions;
  const xAxisRelatedPanelItem = getEnabledPanelItems(panels, 'category')[0];
  const yAxisRelatedPanelItem = getEnabledPanelItems(panels, 'value')[0];

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
  if (!hasYAxisTitleText && yAxisRelatedPanelItem) {
    axisOptions.yAxis = {
      ...axisOptions.yAxis,
      title: {
        ...axisOptions.yAxis?.title,
        text: yAxisRelatedPanelItem.jaql.title,
      },
    } as AxisLabel;
  }

  return axisOptions;
}

/**
 * @internal
 */
function extractCartesianLabelsOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: CartesianWidgetStyle,
) {
  const showTotals =
    widgetStyle.seriesLabels?.enabled && widgetStyle.seriesLabels?.labels?.types?.totals;
  const isStacked =
    widgetSubtype === 'area/stacked' ||
    widgetSubtype === 'area/stackedspline' ||
    widgetSubtype === 'column/stackedcolumn' ||
    widgetSubtype === 'bar/stacked';
  const isStacked100 =
    widgetSubtype === 'area/stacked100' ||
    widgetSubtype === 'area/stackedspline100' ||
    widgetSubtype === 'column/stackedcolumn100' ||
    widgetSubtype === 'bar/stacked100';
  let showValue = widgetStyle.seriesLabels?.enabled ?? false;
  if (isStacked || isStacked100) {
    showValue = !!(
      (isStacked && widgetStyle.seriesLabels?.labels?.types?.relative) ||
      (isStacked100 && widgetStyle.seriesLabels?.labels?.types?.count)
    );
  }
  return {
    ...(showTotals && {
      totalLabels: {
        enabled: showTotals,
        rotation: widgetStyle.seriesLabels?.rotation ?? 0,
      },
    }),
    seriesLabels: {
      enabled: widgetStyle.seriesLabels?.enabled ?? false,
      rotation: widgetStyle.seriesLabels?.rotation ?? 0,
      showValue: showValue,
      showPercentage: !!(isStacked100 && widgetStyle.seriesLabels?.labels?.types?.percentage),
    },
  };
}

function extractCartesianChartStyleOptions(
  widgetType: WidgetType,
  widgetSubtype: WidgetSubtype,
  widgetStyle: CartesianWidgetStyle,
  panels: Panel[],
): CartesianStyleOptions {
  return {
    ...extractBaseStyleOptions(widgetSubtype, widgetStyle),
    ...prepareCartesianChartAxisOptions(widgetType, widgetStyle, panels),
    ...extractCartesianLabelsOptions(widgetSubtype, widgetStyle),
    lineWidth: widgetStyle.lineWidth,
    markers: widgetStyle.markers,
  } as CartesianStyleOptions;
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
    header: {
      color: {
        enabled: widgetStyle['colors/headers'],
      },
    },
    rows: {
      alternatingColor: {
        enabled: widgetStyle['colors/rows'],
      },
    },
    columns: {
      alternatingColor: {
        enabled: widgetStyle['colors/columns'],
      },
    },
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

function extractBoxplotChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: BoxplotWidgetStyle,
  panels: Panel[],
): BoxplotStyleOptions {
  return {
    ...extractBaseStyleOptions(widgetSubtype, widgetStyle),
    ...prepareBoxplotChartAxisOptions(widgetStyle, panels),
  } as BoxplotStyleOptions;
}

function extractScattermapChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: ScattermapWidgetStyle,
): ScattermapStyleOptions {
  return {
    ...extractBaseStyleOptions(widgetSubtype, widgetStyle),
    markers: {
      fill: widgetStyle.markers.fill,
      size: {
        defaultSize: widgetStyle.markers.size.defaultSize,
        minSize: widgetStyle.markers.size.min,
        maxSize: widgetStyle.markers.size.max,
      },
    },
  } as ScattermapStyleOptions;
}

function extractAreamapChartStyleOptions(widgetSubtype: WidgetSubtype): AreamapStyleOptions {
  let mapType: AreamapType;
  switch (widgetSubtype) {
    case 'areamap/world':
      mapType = 'world';
      break;
    case 'areamap/usa':
      mapType = 'usa';
      break;
    default:
      throw new TranslatableError('errors.unsupportedWidgetType', { widgetSubtype });
  }
  return {
    mapType,
  };
}

export function extractPivotTableStyleOptions(
  widgetStyle: PivotWidgetStyle,
): PivotTableStyleOptions {
  return {
    rowsPerPage: parseInt(`${widgetStyle.pageSize}`),
    isAutoHeight: widgetStyle.automaticHeight,
    rowHeight: widgetStyle.rowHeight,
    alternatingRowsColor: widgetStyle.colors?.rows,
    alternatingColumnsColor: widgetStyle.colors?.columns,
    headersColor: widgetStyle.colors?.headers,
    membersColor: widgetStyle.colors?.members,
    totalsColor: widgetStyle.colors?.totals,
  };
}

export function extractStyleOptions<WType extends WidgetType>(
  widgetType: WType,
  widget: WidgetDto,
): ChartStyleOptions | TableStyleOptions | TextWidgetStyleOptions {
  const {
    subtype: widgetSubtype,
    style,
    metadata: { panels },
  } = widget as WidgetDto & { subtype: WidgetSubtype };
  switch (widgetType) {
    case 'chart/line':
    case 'chart/area':
    case 'chart/bar':
    case 'chart/column': {
      const styleOptions = extractCartesianChartStyleOptions(
        widgetType,
        widgetSubtype,
        style as CartesianWidgetStyle,
        panels,
      );
      if (styleOptions.navigator) {
        const scrollerLocation = widget.options?.previousScrollerLocation;
        styleOptions.navigator.scrollerLocation = isValidScrollerLocation(scrollerLocation)
          ? scrollerLocation
          : undefined;
      }
      return styleOptions;
    }
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
    case 'pivot':
    case 'pivot2':
      return extractPivotTableStyleOptions(style as PivotWidgetStyle);
    case 'indicator':
      return extractIndicatorChartStyleOptions(
        widgetSubtype,
        style as IndicatorWidgetStyle,
        panels,
      );
    case 'chart/boxplot': {
      const boxplotStyleOptions = extractBoxplotChartStyleOptions(
        widgetSubtype,
        style as BoxplotWidgetStyle,
        panels,
      );
      if (boxplotStyleOptions.navigator) {
        boxplotStyleOptions.navigator.scrollerLocation = isValidScrollerLocation(
          widget.options?.previousScrollerLocation,
        )
          ? widget.options?.previousScrollerLocation
          : undefined;
      }
      return boxplotStyleOptions;
    }
    case 'map/scatter':
      return extractScattermapChartStyleOptions(widgetSubtype, style as ScattermapWidgetStyle);
    case 'map/area':
      return extractAreamapChartStyleOptions(widgetSubtype);
    case 'richtexteditor':
      return (style as TextWidgetDtoStyle).content;
    default:
      throw new TranslatableError('errors.unsupportedWidgetType', { widgetType });
  }
}

export const getFlattenWidgetDesign = (widgetDesign: WidgetDesign) => {
  return {
    backgroundColor: widgetDesign.widgetBackgroundColor,
    spaceAround: LEGACY_DESIGN_TYPES[widgetDesign.widgetSpacing] as SpaceSizes,
    cornerRadius: LEGACY_DESIGN_TYPES[widgetDesign.widgetCornerRadius] as RadiusSizes,
    shadow: LEGACY_DESIGN_TYPES[widgetDesign.widgetShadow] as ShadowsTypes,
    border: widgetDesign.widgetBorderEnabled,
    borderColor: widgetDesign.widgetBorderColor,
    header: {
      titleTextColor: widgetDesign.widgetTitleColor,
      titleAlignment: LEGACY_DESIGN_TYPES[widgetDesign.widgetTitleAlignment] as AlignmentTypes,
      dividerLine: widgetDesign.widgetTitleDividerEnabled,
      dividerLineColor: widgetDesign.widgetTitleDividerColor,
      backgroundColor: widgetDesign.widgetTitleBackgroundColor,
    },
  };
};

/**
 * Merges the widget style with the widget design
 *
 * @param widgetStyle - The widget style
 * @param widgetDesign - The widget design
 * @param isWidgetDesignStyleEnabled - The flag to enable the widget design style
 * @returns The merged widget style
 */
export function getStyleWithWidgetDesign(
  widgetStyle: ChartStyleOptions | TableStyleOptions | TextWidgetStyleOptions,
  widgetDesign?: WidgetDesign,
  isWidgetDesignStyleEnabled?: boolean,
): WidgetStyleOptions {
  if (!widgetDesign || !isWidgetDesignStyleEnabled) return widgetStyle;
  const flattenedWidgetDesign = getFlattenWidgetDesign(widgetDesign);

  return {
    ...widgetStyle,
    ...flattenedWidgetDesign,
  };
}
