/* eslint-disable sonarjs/no-duplicate-string */
import isString from 'lodash-es/isString';

import {
  FunnelDirection,
  FunnelSize,
  FunnelType,
} from '@/chart-options-processor/translations/funnel-plot-options';
import { CALENDAR_HEATMAP_DEFAULTS } from '@/chart/restructured-charts/highchart-based-charts/calendar-heatmap-chart/constants';
import { LEGACY_DESIGN_TYPES } from '@/themes/legacy-design-settings';
import { TranslatableError } from '@/translation/translatable-error.js';
import {
  AlignmentTypes,
  AreamapStyleOptions,
  AreamapType,
  AxisLabel,
  BaseAxisStyleOptions,
  BaseStyleOptions,
  BoxplotStyleOptions,
  CalendarDayOfWeek,
  CalendarHeatmapStyleOptions,
  CalendarHeatmapSubtype,
  CalendarHeatmapViewType,
  CartesianStyleOptions,
  ChartStyleOptions,
  FunnelStyleOptions,
  GaugeIndicatorStyleOptions,
  IndicatorStyleOptions,
  Labels,
  LegendPosition,
  LineStyleOptions,
  LineWidth,
  Markers,
  NumericBarIndicatorStyleOptions,
  NumericSimpleIndicatorStyleOptions,
  PieStyleOptions,
  PivotTableStyleOptions,
  PolarStyleOptions,
  RadiusSizes,
  ScattermapStyleOptions,
  ScatterStyleOptions,
  ShadowsTypes,
  SpaceSizes,
  StackableStyleOptions,
  SunburstStyleOptions,
  TabberButtonsWidgetStyleOptions,
  TableStyleOptions,
  TextWidgetStyleOptions,
  TreemapStyleOptions,
  WidgetStyleOptions,
} from '@/types.js';

import {
  AxisStyle,
  BoxplotWidgetStyle,
  CalendarHeatmapWidgetStyle,
  CartesianWidgetStyle,
  FunnelWidgetStyle,
  FusionWidgetType,
  IndicatorWidgetStyle,
  isValidScrollerLocation,
  Panel,
  PieWidgetStyle,
  PivotWidgetStyle,
  PolarWidgetStyle,
  ScattermapWidgetStyle,
  ScatterWidgetStyle,
  SunburstWidgetStyle,
  TabberWidgetDtoStyle,
  TableWidgetStyle,
  TextWidgetDtoStyle,
  TreemapWidgetStyle,
  WidgetDesign,
  WidgetDto,
  WidgetStyle,
  WidgetSubtype,
} from '../types.js';
import { getChartSubtype, getEnabledPanelItems } from '../utils.js';
import { extractTabberButtonsWidgetStyleOptions } from './tabber.js';

/**
 * Helper function to extract axis style options from WidgetDto
 */
function extractAxisStyleOptions(widgetAxisStyleOptions?: AxisStyle): AxisLabel {
  const {
    min,
    max,
    enabled,
    gridLines,
    intervalJumps,
    isIntervalEnabled,
    labels,
    logarithmic,
    title,
  } = widgetAxisStyleOptions || {};

  return {
    enabled,
    gridLines,
    intervalJumps,
    isIntervalEnabled,
    // any non-number value of 'min/max' options should be removed
    min: typeof min === 'number' ? min : undefined,
    max: typeof max === 'number' ? max : undefined,
    logarithmic,
    ...(title && { title: { enabled: title.enabled, text: title.text } }),
    ...(labels && { labels: { enabled: labels.enabled } }),
  };
}

type AxisStyleOptions = Pick<BaseAxisStyleOptions, 'xAxis' | 'yAxis' | 'y2Axis'>;

/**
 * Helper function to extract cartesian chart axis options from WidgetDto
 */
function extractCartesianChartAxisOptions(
  widgetType: FusionWidgetType,
  widgetStyle: CartesianWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.xAxis),
    yAxis: extractAxisStyleOptions(widgetStyle.yAxis),
    y2Axis: extractAxisStyleOptions(widgetStyle.y2Axis),
  } as AxisStyleOptions;
  const widgetTypesWithXAxis: FusionWidgetType[] = ['chart/line', 'chart/area'];
  const xAxesRelatedPanelName = widgetTypesWithXAxis.includes(widgetType) ? 'x-axis' : 'categories';
  const xAxesRelatedPanelItems = getEnabledPanelItems(panels, xAxesRelatedPanelName);
  const yAxesRelatedPanelItems = getEnabledPanelItems(panels, 'values');
  const hasX2Axis = xAxesRelatedPanelItems.length === 2;

  if (hasX2Axis) {
    const { title, x2Title } = widgetStyle.xAxis;
    // Notes: Swap 'title' and 'x2Title' options since, in the current widget model, 'title' represents the top axis
    // while 'x2Title' represents the bottom axis, which contradicts our interface.
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      title: {
        enabled: x2Title?.enabled,
        text: x2Title?.text,
      },
      x2Title: {
        enabled: title?.enabled,
        text: title?.text,
      },
    } as AxisLabel;
  }

  const hasXAxisTitleText = isString(axisOptions.xAxis?.title?.text);
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

  const hasX2AxisTitleText = isString(axisOptions.xAxis?.x2Title?.text);
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
  const hasYAxisTitleText = isString(axisOptions.yAxis?.title?.text);
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

  const hasY2AxisTitleText = isString(axisOptions.y2Axis?.title?.text);
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

/**
 * Helper function to extract polar chart axis options from WidgetDto
 */
function extractPolarChartAxisOptions(
  widgetStyle: PolarWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.categories),
    yAxis: extractAxisStyleOptions(widgetStyle.axis),
  } as AxisStyleOptions;
  const xAxisRelatedPanelItem = getEnabledPanelItems(panels, 'categories')[0];

  const hasXAxisTitleText = isString(axisOptions.xAxis?.title?.text);
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

function extractScatterChartAxisOptions(
  widgetStyle: ScatterWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.xAxis),
    yAxis: extractAxisStyleOptions(widgetStyle.yAxis),
  } as AxisStyleOptions;
  const xAxisRelatedPanelItem = getEnabledPanelItems(panels, 'x-axis')[0];
  const yAxisRelatedPanelItems = getEnabledPanelItems(panels, 'y-axis')[0];

  const hasXAxisTitleText = isString(axisOptions.xAxis?.title?.text);
  if (!hasXAxisTitleText && xAxisRelatedPanelItem) {
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      title: {
        ...axisOptions.xAxis?.title,
        text: xAxisRelatedPanelItem.jaql.title,
      },
    } as AxisLabel;
  }

  const hasYAxisTitleText = isString(axisOptions.yAxis?.title?.text);
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

/**
 * Helper function to extract boxplot chart axis options from WidgetDto
 */
function extractBoxplotChartAxisOptions(
  widgetStyle: BoxplotWidgetStyle,
  panels: Panel[],
): AxisStyleOptions {
  const axisOptions = {
    xAxis: extractAxisStyleOptions(widgetStyle.xAxis),
    yAxis: extractAxisStyleOptions(widgetStyle.yAxis),
  } as AxisStyleOptions;
  const xAxisRelatedPanelItem = getEnabledPanelItems(panels, 'category')[0];
  const yAxisRelatedPanelItem = getEnabledPanelItems(panels, 'value')[0];

  const hasXAxisTitleText = isString(axisOptions.xAxis?.title?.text);
  if (!hasXAxisTitleText && xAxisRelatedPanelItem) {
    axisOptions.xAxis = {
      ...axisOptions.xAxis,
      title: {
        ...axisOptions.xAxis?.title,
        text: xAxisRelatedPanelItem.jaql.title,
      },
    } as AxisLabel;
  }

  const hasYAxisTitleText = isString(axisOptions.yAxis?.title?.text);
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
 * Helper function to extract values (series labels) chart labels options from WidgetDto
 */
function extractValueLabelsOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: CartesianWidgetStyle | PolarWidgetStyle | ScatterWidgetStyle | BoxplotWidgetStyle,
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

/**
 * Helper function to extract chart subtype
 */
function extractChartSubtype(widgetSubtype: WidgetSubtype): { subtype?: string } {
  const chartSubtype = getChartSubtype(widgetSubtype);
  return chartSubtype ? { subtype: chartSubtype } : {};
}

/**
 * Helper function to extract navigator options with scroller location from WidgetDto
 */
function extractNavigatorOptions(
  widgetStyle: WidgetStyle,
  widgetOptions?: WidgetDto['options'],
): Pick<BaseAxisStyleOptions, 'navigator'> {
  if ('navigator' in widgetStyle) {
    const navigator: CartesianStyleOptions['navigator'] = {
      enabled: widgetStyle.navigator.enabled,
    };
    const scrollerLocation = widgetOptions?.previousScrollerLocation;
    if (scrollerLocation && isValidScrollerLocation(scrollerLocation)) {
      navigator.scrollerLocation = scrollerLocation;
    }

    return { navigator };
  }

  return {};
}

/**
 * Helper function to extract legend options from WidgetDto
 */
function extractLegendOptions(widgetStyle: WidgetStyle): Pick<BaseStyleOptions, 'legend'> {
  if ('legend' in widgetStyle && widgetStyle.legend) {
    return {
      legend: {
        enabled: widgetStyle.legend.enabled,
        position: widgetStyle.legend.position as LegendPosition,
      },
    };
  }

  return {};
}

/**
 * Helper function to extract data limits options from WidgetDto
 */
function extractDataLimitsOptions(
  widgetStyle: WidgetStyle,
): Pick<CartesianStyleOptions, 'dataLimits'> {
  if ('dataLimits' in widgetStyle && widgetStyle.dataLimits) {
    const { seriesCapacity, categoriesCapacity } = widgetStyle.dataLimits;
    return {
      dataLimits: {
        seriesCapacity,
        categoriesCapacity,
      },
    };
  }

  return {};
}

/**
 * Helper function to extract line width options from WidgetDto
 */
function extractLineWidthOptions(
  widgetStyle: CartesianWidgetStyle,
): Pick<LineStyleOptions, 'lineWidth'> {
  if (widgetStyle.lineWidth) {
    const { width } = widgetStyle.lineWidth;
    return { lineWidth: { width } as LineWidth };
  }

  return {};
}

/**
 * Helper function to extract markers options from WidgetDto
 */
function extractMarkersOptions(
  widgetStyle: CartesianWidgetStyle,
): Pick<BaseAxisStyleOptions, 'markers'> {
  if (widgetStyle.markers) {
    const { enabled, size, fill } = widgetStyle.markers;
    return {
      markers: {
        enabled,
        size,
        fill,
      } as Markers,
    };
  }

  return {};
}

function extractCategoricalLabelsOptions(widgetStyle: WidgetStyle): { labels?: Labels } {
  if ('labels' in widgetStyle && widgetStyle.labels) {
    const { enabled, categories, percent, decimals, value } = widgetStyle.labels;
    return {
      labels: {
        enabled,
        categories,
        percent,
        decimals,
        value,
      },
    };
  }

  return {};
}

/**
 * Common function to extract base cartesian chart style options (without navigator)
 */
function extractBaseCartesianStyleOptions(
  widgetType: FusionWidgetType,
  widgetSubtype: WidgetSubtype,
  widgetStyle: CartesianWidgetStyle,
  panels: Panel[],
): CartesianStyleOptions {
  return {
    ...(extractChartSubtype(widgetSubtype) as StackableStyleOptions),
    ...extractLegendOptions(widgetStyle),
    ...extractCartesianChartAxisOptions(widgetType, widgetStyle, panels),
    ...extractValueLabelsOptions(widgetSubtype, widgetStyle),
    ...extractDataLimitsOptions(widgetStyle),
  };
}

/**
 * Extract style options for line charts
 */
function extractLineChartStyleOptions(widget: WidgetDto): CartesianStyleOptions {
  const widgetSubtype = widget.subtype as WidgetSubtype;
  const widgetStyle = widget.style as CartesianWidgetStyle;

  return {
    ...extractBaseCartesianStyleOptions(
      'chart/line',
      widgetSubtype,
      widgetStyle,
      widget.metadata.panels,
    ),
    ...extractNavigatorOptions(widgetStyle, widget.options),
    // Line-specific properties:
    ...extractLineWidthOptions(widgetStyle),
    ...extractMarkersOptions(widgetStyle),
  };
}

/**
 * Extract style options for area charts
 */
function extractAreaChartStyleOptions(widget: WidgetDto): CartesianStyleOptions {
  const widgetSubtype = widget.subtype as WidgetSubtype;
  const widgetStyle = widget.style as CartesianWidgetStyle;

  return {
    ...extractBaseCartesianStyleOptions(
      'chart/area',
      widgetSubtype,
      widgetStyle,
      widget.metadata.panels,
    ),
    ...extractNavigatorOptions(widgetStyle, widget.options),
    // Area-specific properties:
    ...extractLineWidthOptions(widgetStyle),
    ...extractMarkersOptions(widgetStyle),
  };
}

/**
 * Extract style options for bar charts
 */
function extractBarChartStyleOptions(widget: WidgetDto): CartesianStyleOptions {
  const widgetSubtype = widget.subtype as WidgetSubtype;
  const widgetStyle = widget.style as CartesianWidgetStyle;

  return {
    ...extractBaseCartesianStyleOptions(
      'chart/bar',
      widgetSubtype,
      widgetStyle,
      widget.metadata.panels,
    ),
    ...extractNavigatorOptions(widgetStyle, widget.options),
  };
}

/**
 * Extract style options for column charts
 */
function extractColumnChartStyleOptions(widget: WidgetDto): CartesianStyleOptions {
  const widgetSubtype = widget.subtype as WidgetSubtype;
  const widgetStyle = widget.style as CartesianWidgetStyle;

  return {
    ...extractBaseCartesianStyleOptions(
      'chart/column',
      widgetSubtype,
      widgetStyle,
      widget.metadata.panels,
    ),
    ...extractNavigatorOptions(widgetStyle, widget.options),
  };
}

function extractPolarChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: PolarWidgetStyle,
  panels: Panel[],
): PolarStyleOptions {
  return {
    ...(extractChartSubtype(widgetSubtype) as PolarStyleOptions),
    ...extractLegendOptions(widgetStyle),
    ...extractPolarChartAxisOptions(widgetStyle, panels),
    ...extractDataLimitsOptions(widgetStyle),
    ...extractValueLabelsOptions(widgetSubtype, widgetStyle),
  };
}

/**
 * Helper function to extract scatter chart style options from WidgetDto
 */
function extractScatterChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: ScatterWidgetStyle,
  panels: Panel[],
): ScatterStyleOptions {
  return {
    ...(extractChartSubtype(widgetSubtype) as ScatterStyleOptions),
    ...extractLegendOptions(widgetStyle),
    ...extractScatterChartAxisOptions(widgetStyle, panels),
    ...extractDataLimitsOptions(widgetStyle),
    ...extractValueLabelsOptions(widgetSubtype, widgetStyle),
    // Extract scatter-specific properties
    ...(widgetStyle.markerSize && {
      markerSize: {
        scatterDefaultSize: widgetStyle.markerSize.defaultSize,
        scatterBubbleMinSize: widgetStyle.markerSize.min,
        scatterBubbleMaxSize: widgetStyle.markerSize.max,
      },
    }),
  };
}

/**
 * Helper function to extract table chart style options from WidgetDto
 */
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
      width: widgetStyle['width/content']
        ? 'content'
        : widgetStyle['width/window']
        ? 'auto'
        : undefined,
    },
  };
}

/**
 * Helper function to extract funnel chart style options from WidgetDto
 */
function extractFunnelChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: FunnelWidgetStyle,
): FunnelStyleOptions {
  return {
    ...(extractChartSubtype(widgetSubtype) as FunnelStyleOptions),
    ...extractLegendOptions(widgetStyle),
    ...extractCategoricalLabelsOptions(widgetStyle),
    // Extract funnel-specific properties
    funnelSize: widgetStyle.size as FunnelSize,
    funnelType: widgetStyle.type as FunnelType,
    funnelDirection: widgetStyle.direction as FunnelDirection,
  };
}

function extractPieChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: PieWidgetStyle,
): PieStyleOptions {
  // Extract pie-specific style options without spreading all widget properties
  const chartSubtype = extractChartSubtype(widgetSubtype) as PieStyleOptions;
  return {
    // Add subtype if available and it's a pie subtype
    ...(chartSubtype.subtype &&
      ['pie/classic', 'pie/donut', 'pie/ring'].includes(chartSubtype.subtype) &&
      chartSubtype),
    ...extractLegendOptions(widgetStyle),
    ...extractCategoricalLabelsOptions(widgetStyle),
    ...extractDataLimitsOptions(widgetStyle),
    ...(widgetStyle.convolution && {
      convolution: {
        enabled: widgetStyle.convolution.enabled!,
        independentSlicesCount: widgetStyle.convolution.independentSlicesCount,
        minimalIndependentSlicePercentage:
          widgetStyle.convolution.minimalIndependentSlicePercentage,
        selectedConvolutionType: widgetStyle.convolution.selectedConvolutionType,
      },
    }),
  };
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

/**
 * Helper function to extract indicator chart style options from WidgetDto
 */
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

/**
 * Helper function to extract treemap chart style options from WidgetDto
 */
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

/**
 * Helper function to extract sunburst chart style options from WidgetDto
 */
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

/**
 * Helper function to extract boxplot chart style options from WidgetDto
 */
function extractBoxplotChartStyleOptions(widget: WidgetDto): BoxplotStyleOptions {
  const widgetSubtype = widget.subtype as WidgetSubtype;
  const widgetStyle = widget.style as BoxplotWidgetStyle;

  return {
    ...(extractChartSubtype(widgetSubtype) as BoxplotStyleOptions),
    ...extractLegendOptions(widgetStyle),
    ...extractBoxplotChartAxisOptions(widgetStyle, widget.metadata.panels),
    ...extractValueLabelsOptions(widgetSubtype, widgetStyle),
    ...extractDataLimitsOptions(widgetStyle),
    ...extractNavigatorOptions(widgetStyle, widget.options),
  };
}

/**
 * Helper function to extract scattermap chart style options from WidgetDto
 */
function extractScattermapChartStyleOptions(
  widgetSubtype: WidgetSubtype,
  widgetStyle: ScattermapWidgetStyle,
): ScattermapStyleOptions {
  return {
    ...(extractChartSubtype(widgetSubtype) as ScattermapStyleOptions),
    // Extract scattermap-specific properties
    markers: {
      fill: widgetStyle.markers.fill,
      size: {
        defaultSize: widgetStyle.markers.size.defaultSize,
        minSize: widgetStyle.markers.size.min,
        maxSize: widgetStyle.markers.size.max,
      },
    },
  };
}

/**
 * Helper function to extract areamap chart style options from WidgetDto
 */
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

/**
 * Helper function to extract calendar heatmap chart style options from WidgetDto
 */
function extractCalendarHeatmapChartStyleOptions(
  widgetStyle: CalendarHeatmapWidgetStyle,
): CalendarHeatmapStyleOptions {
  let viewType: CalendarHeatmapViewType = CALENDAR_HEATMAP_DEFAULTS.VIEW_TYPE;
  let subtype: CalendarHeatmapSubtype = CALENDAR_HEATMAP_DEFAULTS.SUBTYPE;

  if (widgetStyle['view/weekly']) {
    subtype = 'calendar-heatmap/continuous';
  }

  if (widgetStyle['domain/year']) {
    viewType = 'year';
  } else if (widgetStyle['domain/half-year']) {
    viewType = 'half-year';
  } else if (widgetStyle['domain/quarter']) {
    viewType = 'quarter';
  } else if (widgetStyle['domain/month']) {
    viewType = 'month';
  }

  let startOfWeek: CalendarDayOfWeek = CALENDAR_HEATMAP_DEFAULTS.START_OF_WEEK;

  if (widgetStyle['week/monday']) {
    startOfWeek = 'monday';
  } else if (widgetStyle['week/sunday']) {
    startOfWeek = 'sunday';
  }

  let startMonth: Date | undefined;
  if (widgetStyle.startMonth) {
    if (typeof widgetStyle.startMonth === 'object') {
      // Create date from object containing year and month values
      startMonth = new Date(widgetStyle.startMonth.year, widgetStyle.startMonth.month);
    } else {
      // Create date from date string
      startMonth = new Date(widgetStyle.startMonth);
    }
  }

  return {
    subtype,
    viewType,
    startOfWeek,
    cellLabels: {
      enabled: widgetStyle.dayNumberEnabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_CELL_LABEL,
    },
    dayLabels: {
      enabled: widgetStyle.dayNameEnabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL,
    },
    monthLabels: {
      enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_MONTH_LABEL,
    },
    weekends: {
      enabled: widgetStyle.grayoutEnabled ?? CALENDAR_HEATMAP_DEFAULTS.WEEKEND_ENABLED,
      days: widgetStyle.grayoutEnabled ? [...CALENDAR_HEATMAP_DEFAULTS.WEEKEND_DAYS] : [],
      cellColor: CALENDAR_HEATMAP_DEFAULTS.WEEKEND_CELL_COLOR,
      hideValues: true,
    },
    pagination: {
      enabled: CALENDAR_HEATMAP_DEFAULTS.SHOW_PAGINATION,
      startMonth,
    },
  };
}

/**
 * Helper function to extract pivot table chart style options from WidgetDto
 */
export function extractPivotTableStyleOptions(widget: WidgetDto): PivotTableStyleOptions {
  const widgetStyle = widget.style as PivotWidgetStyle;
  return {
    rowsPerPage: parseInt(`${widgetStyle.pageSize}`),
    isAutoHeight: widgetStyle.automaticHeight,
    rowHeight: widgetStyle.rowHeight,
    alternatingRowsColor: widgetStyle.colors?.rows,
    alternatingColumnsColor: widgetStyle.colors?.columns,
    headersColor: widgetStyle.colors?.headers,
    membersColor: widgetStyle.colors?.members,
    totalsColor: widgetStyle.colors?.totals,
    imageColumns: widget.options?.imageColumns,
  };
}

/**
 * Helper function to extract style options from WidgetDto
 */
export function extractStyleOptions<WType extends FusionWidgetType>(
  widgetType: WType,
  widget: WidgetDto,
):
  | ChartStyleOptions
  | TableStyleOptions
  | TextWidgetStyleOptions
  | TabberButtonsWidgetStyleOptions {
  const {
    subtype: widgetSubtype,
    style,
    metadata: { panels },
  } = widget as WidgetDto & { subtype: WidgetSubtype };
  switch (widgetType) {
    case 'chart/line':
      return extractLineChartStyleOptions(widget);
    case 'chart/area':
      return extractAreaChartStyleOptions(widget);
    case 'chart/bar':
      return extractBarChartStyleOptions(widget);
    case 'chart/column':
      return extractColumnChartStyleOptions(widget);
    case 'chart/polar':
      return extractPolarChartStyleOptions(widgetSubtype, style as PolarWidgetStyle, panels);
    case 'chart/scatter':
      return extractScatterChartStyleOptions(widgetSubtype, style as ScatterWidgetStyle, panels);
    case 'chart/funnel':
      return extractFunnelChartStyleOptions(widgetSubtype, style as FunnelWidgetStyle);
    case 'treemap':
      return extractTreemapChartStyleOptions(style as TreemapWidgetStyle);
    case 'sunburst':
      return extractSunburstChartStyleOptions(style as SunburstWidgetStyle);
    case 'chart/pie':
      return extractPieChartStyleOptions(widgetSubtype, style as PieWidgetStyle);
    case 'tablewidget':
    case 'tablewidgetagg':
      return extractTableChartStyleOptions(style as TableWidgetStyle);
    case 'pivot':
    case 'pivot2':
      return extractPivotTableStyleOptions(widget);
    case 'indicator':
      return extractIndicatorChartStyleOptions(
        widgetSubtype,
        style as IndicatorWidgetStyle,
        panels,
      );
    case 'chart/boxplot':
      return extractBoxplotChartStyleOptions(widget);
    case 'map/scatter':
      return extractScattermapChartStyleOptions(widgetSubtype, style as ScattermapWidgetStyle);
    case 'map/area':
      return extractAreamapChartStyleOptions(widgetSubtype);
    case 'heatmap':
      return extractCalendarHeatmapChartStyleOptions(style as CalendarHeatmapWidgetStyle);
    case 'richtexteditor':
      return (style as TextWidgetDtoStyle).content;
    case 'WidgetsTabber': // DTO type from Fusion (maps to 'tabber-buttons' in CSDK)
      return extractTabberButtonsWidgetStyleOptions(style as TabberWidgetDtoStyle);
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
  widgetStyle:
    | ChartStyleOptions
    | TableStyleOptions
    | TextWidgetStyleOptions
    | TabberButtonsWidgetStyleOptions,
  widgetDesign?: WidgetDesign,
  isWidgetDesignStyleEnabled?: boolean,
): WidgetStyleOptions {
  if (!widgetDesign || !isWidgetDesignStyleEnabled) return widgetStyle as WidgetStyleOptions;
  const flattenedWidgetDesign = getFlattenWidgetDesign(widgetDesign);

  return {
    ...widgetStyle,
    ...flattenedWidgetDesign,
  };
}
