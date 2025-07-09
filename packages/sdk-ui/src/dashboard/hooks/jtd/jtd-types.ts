import { type Filter } from '@sisense/sdk-data';
import { WidgetProps } from '@/props.js';
import { DataPoint } from '@/types';
import { JtdConfig, JtdDrillTarget } from '@/widget-by-id/types';
import { OpenModalFn } from '@/common/components/modal/modal-context';
import { OpenMenuFn } from '@/common/components/menu/types.js';

/**
 * Menu item structure for JTD navigation
 *
 * @internal
 */
export type JtdMenuItem = {
  caption: string;
  onClick?: () => void;
  subItems?: Array<{
    items: Array<{
      caption: string;
      onClick: () => void;
    }>;
  }>;
} | null;

/**
 * Base interface for core JTD data used across all JTD functions
 *
 * @internal
 */
export interface JtdCoreData {
  /** The JTD config */
  jtdConfig: JtdConfig;
  /** The widget props */
  widgetProps: WidgetProps;
  /** The data point (single point) */
  point?: DataPoint;
  /** The data points (multiple points) */
  points?: DataPoint[];
}

/**
 * Base interface for JTD context data (filters) used across all JTD functions
 *
 * @internal
 */
export interface JtdContext {
  /** The dashboard filters */
  dashboardFilters: Filter[];
  /** The original widget filters */
  originalWidgetFilters: Filter[];
}

/**
 * Base interface for JTD action functions
 *
 * @internal
 */
export interface JtdActions {
  /** The open modal function */
  openModal: OpenModalFn;
  /** The open menu function (optional) */
  openMenu?: OpenMenuFn;
  /** The translation function (optional) */
  translate?: (key: string) => string;
}

/**
 * Extended core data for JTD click handlers that includes drill target
 *
 * @internal
 */
export interface JtdClickHandlerData extends JtdCoreData {
  /** The drill target */
  drillTarget: JtdDrillTarget;
}

/**
 * Configuration for widget transforms, combining config and context
 *
 * @internal
 */
export interface JtdWidgetTransformConfig {
  /** The JTD config */
  jtdConfig: JtdConfig;
  /** The dashboard filters */
  dashboardFilters: Filter[];
  /** The original widget filters */
  originalWidgetFilters: Filter[];
}

/**
 * Event-related data for handling data point clicks
 *
 * @internal
 */
export interface JtdDataPointClickEvent {
  /** The native event */
  nativeEvent: PointerEvent;
  /** Function to get menu item */
  getJumpToDashboardMenuItem: (
    coreData: JtdCoreData,
    context: JtdContext,
    actions: Pick<JtdActions, 'openModal' | 'translate'>,
  ) => JtdMenuItem;
}
