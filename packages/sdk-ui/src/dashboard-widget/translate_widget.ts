/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/**
 * The code here is mostly reverse-engineered from
 * https://gitlab.sisense.com/SisenseTeam/warehouse-client/-/blob/736a0921bd4143fc9fbf63f498b92b1bd31bb3c4/src/components/notebooks/editor/chart_to_dashboard/widget_translator/translate_chart_config.ts
 */

import { ChartDataOptions, StyleOptions, CompleteThemeSettings, TableStyleOptions } from '../types';
import { WidgetDto, WidgetSubtype } from './types';
import { extractDataOptions } from './translate_widget_data_options';
import { extractDrilldownOptions } from './translate_widget_drilldown_options';
import { extractStyleOptions } from './translate_widget_style_options';
import { isSupportedWidgetType, getChartType, isTableWidget } from './utils';
import { extractFilters } from './translate_widget_filters';
import { TableDataOptions } from '../chart-data-options/types';
import { ChartWidgetProps, TableWidgetProps } from '../props';

export type TableWidgetExtractedProps = {
  type: 'table';
  props: TableWidgetProps;
};

export type ChartWidgetExtractedProps = {
  type: 'chart';
  props: ChartWidgetProps;
};

export function extractWidgetProps(
  widget: WidgetDto,
  themeSettings?: CompleteThemeSettings,
): TableWidgetExtractedProps | ChartWidgetExtractedProps {
  const widgetType = widget.type;

  if (!isSupportedWidgetType(widgetType)) {
    throw new Error(`Can't extract props for unsupported widget type - ${widgetType}`);
  }

  return isTableWidget(widgetType)
    ? {
        type: 'table',
        props: {
          dataSource: widget.datasource.title,
          title: widget.title,
          description: widget.desc,
          dataOptions: extractDataOptions(
            widgetType,
            widget.metadata.panels,
            themeSettings,
          ) as TableDataOptions,
          styleOptions: extractStyleOptions(
            widgetType,
            widget.subtype as WidgetSubtype,
            widget.style,
            widget.metadata.panels,
          ) as TableStyleOptions,
          filters: extractFilters(widget.metadata.panels),
        },
      }
    : {
        type: 'chart',
        props: {
          dataSource: widget.datasource.title,
          chartType: getChartType(widgetType),
          title: widget.title,
          description: widget.desc,
          dataOptions: extractDataOptions(
            widgetType,
            widget.metadata.panels,
            themeSettings,
          ) as ChartDataOptions,
          drilldownOptions: extractDrilldownOptions(widgetType, widget.metadata.panels),
          styleOptions: extractStyleOptions(
            widgetType,
            widget.subtype as WidgetSubtype,
            widget.style,
            widget.metadata.panels,
          ) as StyleOptions,
          filters: extractFilters(widget.metadata.panels),
        },
      };
}
