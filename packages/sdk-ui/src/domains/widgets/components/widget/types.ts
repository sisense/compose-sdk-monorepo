import type { BeforeMenuOpenHandler } from '@/infra/contexts/menu-provider/types';

import type { ChartWidgetProps } from '../chart-widget/types';
import type { CustomWidgetProps } from '../custom-widget/types';
import type { FilterWidgetProps } from '../filter-widget/types';
import type { PivotTableWidgetProps } from '../pivot-table-widget/types';
import type { TextWidgetProps } from '../text-widget/types';

export type {
  ChartWidgetConfig,
  CustomWidgetConfig,
  FilterWidgetConfig,
  PivotTableWidgetConfig,
  TextWidgetConfig,
  WidgetConfig,
} from './widget-config';

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
