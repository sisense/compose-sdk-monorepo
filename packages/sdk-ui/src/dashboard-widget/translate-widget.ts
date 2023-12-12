/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */

import { ChartDataOptions, StyleOptions, CompleteThemeSettings, TableStyleOptions } from '../types';
import { WidgetDto, WidgetSubtype } from './types';
import { extractDataOptions } from './translate-widget-data-options';
import { extractDrilldownOptions } from './translate-widget-drilldown-options';
import { extractStyleOptions } from './translate-widget-style-options';
import { isSupportedWidgetType, getChartType, isTabularWidget } from './utils';
import { extractFilters } from './translate-widget-filters';
import { TableDataOptions } from '../chart-data-options/types';
import { ChartWidgetProps, TableWidgetProps } from '../props';
import { TranslatableError } from '../translation/translatable-error';

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
    throw new TranslatableError('errors.unsupportedWidgetType', { widgetType });
  }

  return isTabularWidget(widgetType)
    ? {
        type: 'table',
        props: {
          dataSource: widget.datasource.title,
          title: widget.title,
          description: widget.desc || '',
          dataOptions: extractDataOptions(
            widgetType,
            widget.metadata.panels,
            themeSettings?.palette.variantColors,
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
          description: widget.desc || '',
          dataOptions: extractDataOptions(
            widgetType,
            widget.metadata.panels,
            themeSettings?.palette.variantColors,
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
