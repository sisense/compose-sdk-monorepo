import { CommonFiltersOptions } from '@/domains/dashboarding/common-filters/types';
import type {
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
} from '@/domains/dashboarding/hooks/jtd/jtd-types';
import type { UnsupportedStyleOptions } from '@/domains/widgets/components/widget-by-id/translate-widget-style-options/extract-unsupported-style-options.js';
import type { WidgetDto } from '@/domains/widgets/components/widget-by-id/types';
import { ColorPaletteTheme } from '@/types';

export type {
  CommonFiltersOptions,
  CommonFiltersApplyMode,
  FiltersIgnoringRules,
} from '@/domains/dashboarding/common-filters/types';

/**
 * Part of Dashboard layout, which describes how widgets are arranged in a cell
 */
export interface WidgetsPanelCell {
  /**
   * Flag that indicates if the cell is hidden
   *
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
 *
 * @internal
 */
export type DashboardId = string;
/**
 * Options for widgets in a dashboard
 *
 * For example, how common filters defined at the dashboard level should be applied to widgets.
 */
export type WidgetsOptions = Record<WidgetId, SpecificWidgetOptions>;

/**
 * Dashboard-level options for a specific widget
 */
export type SpecificWidgetOptions = {
  /**
   * Options for common filters defined at the dashboard level to be applied to certain widgets.
   */
  filtersOptions?: CommonFiltersOptions;
  /**
   * Jump To Dashboard config for widgets.
   */
  jtdConfig?: JumpToDashboardConfig | JumpToDashboardConfigForPivot;
  /**
   * Partial snapshot of raw DTO fields preserved from the server response.
   * Required to include all existing options/style when PATCHing a single field (e.g. previousScrollerLocation),
   * because the server replaces the entire object rather than merging.
   *
   * `style` carries only the unsupported style fields not yet first-class translated by the
   * CSDK widget model (extracted via `extractUnsupportedStyleOptions`); they are re-attached
   * to the DTO during serialization with lower priority than rebuilt translation output.
   *
   * @internal
   */
  partialDtoOptions?: {
    options?: WidgetDto['options'];
    style?: UnsupportedStyleOptions;
  };
  /**
   * Dashboard-level link between a filter widget and its backing dashboard filter.
   * Only present for widgets with `widgetType: 'filter'`.
   *
   * @internal
   */
  filterWidgetOptions?: {
    /** `config.guid` of the backing filter in the dashboard filters array. */
    filterId: string;
  };
};

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
