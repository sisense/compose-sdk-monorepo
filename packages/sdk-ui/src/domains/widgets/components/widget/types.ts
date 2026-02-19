import type { BeforeMenuOpenHandler } from '@/infra/contexts/menu-provider/types';

import type { WidgetHeaderConfig } from '../../shared/widget-header/types';
import type { ChartWidgetProps } from '../chart-widget/types';
import type { CustomWidgetProps } from '../custom-widget/types';
import type { PivotTableWidgetProps } from '../pivot-table-widget/types';
import type { TextWidgetProps } from '../text-widget/types';

/**
 * Generic widget configuration (e.g. header menu, toolbar).
 * Shared across chart, pivot, text, and custom widgets.
 */
export type WidgetConfig = {
  /**
   * Configurations for the widget header (e.g. toolbar menu items)
   */
  header?: WidgetHeaderConfig;
};

/**
 * Type of the widget component.
 */
export type WidgetType = 'chart' | 'pivot' | 'text' | 'custom';

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
  | WithCommonWidgetProps<CustomWidgetProps, 'custom'>;
