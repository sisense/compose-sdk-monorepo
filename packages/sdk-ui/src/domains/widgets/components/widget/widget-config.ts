import type { WidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config';

import type { WidgetHeaderConfig } from '../../shared/widget-header/types';

/**
 * Configuration of a chart widget.
 */
export interface ChartWidgetConfig {
  /**
   * Configuration for the widget header, such as the items available in its menu.
   */
  header?: WidgetHeaderConfig;
  /**
   * Configuration for actions available on the widget.
   */
  actions?: {
    /**
     * Configuration for the "Download as CSV" action, which adds an item to the
     * widget's header menu that exports the widget's underlying data as a CSV file.
     *
     * @example
     * Enable CSV download for a widget:
     * ```ts
     * const widgetConfig: ChartWidgetConfig = {
     *   actions: {
     *     downloadCsv: {
     *       enabled: true,
     *     },
     *   },
     * };
     * ```
     */
    downloadCsv?: {
      /**
       * Whether the "Download as CSV" action is enabled for the widget.
       *
       * @default false
       */
      enabled?: boolean;
    };
    /**
     * Configuration for the "Download as Excel" action, which adds an item to the
     * widget's header menu that exports the widget's underlying data as an Excel (XLSX) file.
     *
     * @example
     * Enable Excel download for a widget:
     * ```ts
     * const widgetConfig: ChartWidgetConfig = {
     *   actions: {
     *     downloadExcel: {
     *       enabled: true,
     *     },
     *   },
     * };
     * ```
     */
    downloadExcel?: {
      /**
       * Whether the "Download as Excel" action is enabled for the widget.
       *
       * Note: the widget's `id` is required for Excel export to work, as it is
       * used to build the export request. Without it, the export fails.
       *
       * @default false
       */
      enabled?: boolean;
    };
  };
  /**
   * Configuration for widget narrative.
   */
  narrative?: WidgetNarrativeConfig;
}

/**
 * Configuration of a pivot table widget.
 */
export interface PivotTableWidgetConfig extends ChartWidgetConfig {}

/**
 * Configuration of a custom widget.
 */
export interface CustomWidgetConfig extends Omit<ChartWidgetConfig, 'narrative'> {}

/**
 * Configuration of a text widget.
 */
export interface TextWidgetConfig extends Pick<ChartWidgetConfig, 'header'> {}

/**
 * Configuration of a filter widget.
 *
 * @beta
 */
export interface FilterWidgetConfig extends Pick<ChartWidgetConfig, 'header'> {}

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
