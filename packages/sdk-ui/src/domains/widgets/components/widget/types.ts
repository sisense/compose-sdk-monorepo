import type { WidgetNarrativeConfig } from '@/domains/narrative/core/widget-narrative-config';
import type { BeforeMenuOpenHandler } from '@/infra/contexts/menu-provider/types';

import type { WidgetHeaderConfig } from '../../shared/widget-header/types';
import type { ChartWidgetProps } from '../chart-widget/types';
import type { CustomWidgetProps } from '../custom-widget/types';
import type { FilterWidgetProps } from '../filter-widget/types';
import type { PivotTableWidgetProps } from '../pivot-table-widget/types';
import type { TextWidgetProps } from '../text-widget/types';

/**
 * Configuration of the widget.
 */
export type WidgetConfig = {
  /**
   * Configurations for the widget header (e.g. toolbar menu items)
   *
   * @alpha
   */
  header?: WidgetHeaderConfig;
  /**
   * Configuration for actions available on the widget, such as
   * downloading the widget's data.
   */
  actions?: {
    /**
     * Configuration for the "Download as CSV" action, which adds an item to the
     * widget's header menu that exports the widget's underlying data as a CSV file.
     *
     * @example
     * Enable CSV download for a widget:
     * ```ts
     * const widgetConfig: WidgetConfig = {
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
     * const widgetConfig: WidgetConfig = {
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
};

/**
 * Type of the widget component.
 */
export type WidgetType = 'chart' | 'pivot' | 'text' | 'custom' | 'filter';

/**
 * A utility type that combines widget-specific properties (`BaseWidget`)
 * with a common widget props including corresponding widget type (`Type`).
 */
export type WithCommonWidgetProps<BaseWidget, Type extends WidgetType> = BaseWidget & {
  /**
   * Unique identifier of the widget within the container component (dashboard)
   *
   */
  readonly id: string;
  /**
   * Widget type
   */
  widgetType: Type;
  /**
   * Optional handler function to process menu options before opening the context menu.
   *
   * @internal
   */
  onBeforeMenuOpen?: BeforeMenuOpenHandler;
};

/**
 * Props for the widget component within a container component like dashboard.
 */
export type WidgetProps =
  | WithCommonWidgetProps<ChartWidgetProps, 'chart'>
  | WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'>
  | WithCommonWidgetProps<TextWidgetProps, 'text'>
  | WithCommonWidgetProps<CustomWidgetProps, 'custom'>
  | WithCommonWidgetProps<FilterWidgetProps, 'filter'>;
