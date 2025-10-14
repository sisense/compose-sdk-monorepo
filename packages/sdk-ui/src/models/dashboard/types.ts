import { CommonFiltersOptions } from '@/common-filters/types';
import type {
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
} from '@/dashboard/hooks/jtd/jtd-types';
import { ColorPaletteTheme, TabberConfig } from '@/types';

export type {
  CommonFiltersOptions,
  CommonFiltersApplyMode,
  FiltersIgnoringRules,
} from '@/common-filters/types';

/**
 * Part of Dashboard layout, which describes how widgets are arranged in a cell
 */
export interface WidgetsPanelCell {
  /**
   * Flag that indicates if the cell is hidden
   * @internal
   */
  hidden?: boolean;
  widthPercentage: number;
  /**
   * @privateRemarks
   * This value appears to be overwritten by the widget's height property.
   * Marking as optional and internal for now.
   * @internal
   */
  height?: number | string;
  /**
   * @internal
   */
  minHeight?: number;
  /**
   * @internal
   */
  maxHeight?: number;
  /**
   * @internal
   */
  minWidth?: number;
  /**
   * @internal
   */
  maxWidth?: number;
  widgetId: string;
}

/**
 * Part of Dashboard layout, which describes how widgets are arranged in a row
 */
export interface WidgetsPanelRow {
  cells: WidgetsPanelCell[];
}

/**
 * Part of Dashboard layout, which describes how widgets are arranged in a column
 */
export interface WidgetsPanelColumn {
  widthPercentage: number;
  rows: WidgetsPanelRow[];
}

/**
 * Dashboard layout, which describes how widgets are arranged in the dashboard
 */
export interface WidgetsPanelColumnLayout {
  columns: WidgetsPanelColumn[];
}

/**
 * Layout of dashboard widgets panel, which is a union of different layout algorithms
 */
export type WidgetsPanelLayout = WidgetsPanelColumnLayout;

/**
 * Widget ID
 */
export type WidgetId = string;

/**
 * Dashboard ID
 * @internal
 */
export type DashboardId = string;
/**
 * Options for widgets in a dashboard
 *
 * For example, how common filters defined at the dashboard level should be applied to widgets.
 */
export type WidgetsOptions = Record<
  WidgetId,
  {
    filtersOptions?: CommonFiltersOptions;
    /**
     * Jump To Dashboard config for widgets.
     */
    jtdConfig?: JumpToDashboardConfig | JumpToDashboardConfigForPivot;
  }
>;
/**
 * Options for TabberWidets in a dashboard
 *
 * This property actually moves responsibility on the layout management from the tabber widgets to the dashboard,
 * storing all the tabbers configs in the single place
 *
 * @internal
 */
export type TabbersOptions = Record<WidgetId, TabberConfig>;

/**
 * Style options for the dashboard.
 */
export type DashboardStyleOptions = {
  /** Collection of colors used to color various elements */
  palette?: ColorPaletteTheme;
  /** Background color */
  backgroundColor?: string;
  /** Width of the divider line between widgets */
  dividerLineWidth?: number;
  /** Divider line color */
  dividerLineColor?: string;
};
