import {
  type ChartWidgetConfig as ChartWidgetConfigPreact,
  type CustomWidgetConfig as CustomWidgetConfigPreact,
  type FilterWidgetConfig as FilterWidgetConfigPreact,
  type PivotTableWidgetConfig as PivotTableWidgetConfigPreact,
  type TextWidgetConfig as TextWidgetConfigPreact,
} from '@sisense/sdk-ui-preact';

import { type WidgetHeaderConfig } from './widget-header-config';

/**
 * Configuration of a chart widget.
 */
export interface ChartWidgetConfig extends Omit<ChartWidgetConfigPreact, 'header'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetConfig.header}
   */
  header?: WidgetHeaderConfig;
}

/**
 * Configuration of a pivot table widget.
 */
export interface PivotTableWidgetConfig extends Omit<PivotTableWidgetConfigPreact, 'header'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetConfig.header}
   */
  header?: WidgetHeaderConfig;
}

/**
 * Configuration of a custom widget.
 */
export interface CustomWidgetConfig extends Omit<CustomWidgetConfigPreact, 'header'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!CustomWidgetConfig.header}
   */
  header?: WidgetHeaderConfig;
}

/**
 * Configuration of a text widget.
 */
export interface TextWidgetConfig extends Omit<TextWidgetConfigPreact, 'header'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!TextWidgetConfig.header}
   */
  header?: WidgetHeaderConfig;
}

/**
 * Configuration of a filter widget.
 *
 * @beta
 */
export interface FilterWidgetConfig extends Omit<FilterWidgetConfigPreact, 'header'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!FilterWidgetConfig.header}
   */
  header?: WidgetHeaderConfig;
}

/**
 * Configuration of a widget — the union of every widget-type-specific configuration.
 *
 * Used where the widget type is not known statically, for example {@link WidgetModel.config}. When
 * the widget type is known, prefer that widget's own configuration type, which lists only the
 * options the widget supports.
 */
export type WidgetConfig =
  | ChartWidgetConfig
  | PivotTableWidgetConfig
  | CustomWidgetConfig
  | TextWidgetConfig
  | FilterWidgetConfig;
