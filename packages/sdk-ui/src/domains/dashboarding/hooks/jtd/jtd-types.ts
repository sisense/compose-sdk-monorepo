import { Attribute, type Filter, Measure } from '@sisense/sdk-data';

import { DashboardConfig, DashboardProps } from '@/domains/dashboarding/types';
import { OpenMenuFn } from '@/infra/contexts/menu-provider/types.js';
import { OpenModalFn } from '@/infra/contexts/modal-provider/modal-context';
import { WidgetProps } from '@/props.js';
import { DataPoint } from '@/types';

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
  /** Extra filters to be applied with highest priority */
  extraFilters?: Filter[];
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
 * Extended core data for JTD click handlers that includes jump target
 *
 * @internal
 */
export interface JtdClickHandlerData extends JtdCoreData {
  /** The jump target */
  jumpTarget: JtdTarget;
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
  /** Extra filters to be applied with highest priority */
  extraFilters?: Filter[];
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

/**
 * Configuration for Jump To Dashboard functionality.
 * Allows users to navigate from a widget to another dashboard with contextual filtering.
 */
export interface JumpToDashboardConfig {
  /**
   * Whether Jump To Dashboard functionality is enabled
   * @default true
   */
  enabled?: boolean;
  /** List of target dashboards that can be navigated to */
  targets: JtdTarget[];
  /** Configuration for user interaction behavior */
  interaction?: {
    /**
     * How users trigger the jump action
     * Note that not all widgets support both trigger methods
     *
     * @default 'rightclick'
     **/
    triggerMethod?: TriggerMethod;
    /**
     * Caption prefix for jumping action (i.e in context menu)
     * @default 'Jump to'
     */
    captionPrefix?: string;
    /**
     * Whether to show the Jump To Dashboard icon in the toolbar of the source widget
     * @default true
     */
    showIcon?: boolean;
  };
  /**
   * Configuration for the target dashboard display.
   * This configuration will be merged with target dashboard config, having higher priority
   * @default {}
   */
  targetDashboardConfig?: DashboardConfig;
  /** Configuration for filter handling between source and target dashboards */
  filtering?: {
    /**
     * Additional filters to apply to the target dashboard
     *
     * @example
     * const extraFilters = [dashboardProps.filters[0], dashboardProps.widgets[0].filters[0]]
     *
     * @default []
     */
    extraFilters?: Filter[];
    /**
     * Dashboard-level filter dimensions to pass through
     *
     * undefined - include all
     * [] - include nothing
     * [string] - include specific dimensions
     *
     * example: ["[ER.Date (Calendar)]", "[Doctors.Specialty]"]
     * @default undefined
     */
    includeDashboardFilters?: string[];
    /**
     * Widget-level filter dimensions to pass through
     *
     * undefined - include all
     * [] - include nothing
     * [string] - include specific dimensions
     *
     * example: ["[ER.Date (Calendar)]", "[Doctors.Specialty]"]
     * @default undefined
     */
    includeWidgetFilters?: string[];
    /**
     * Whether to merge filters with existing target dashboard filters or replace them
     * @default false
     */
    mergeWithTargetFilters?: boolean;
  };
  /** Configuration for the modal window that will display the target dashboard */
  modal?: {
    /**
     * Width of the modal window
     * @default 85 (when measurementUnit is '%') or 1200 (when measurementUnit is 'px')
     */
    width?: number;
    /**
     * Height of the modal window
     * @default 85 (when measurementUnit is '%') or 800 (when measurementUnit is 'px')
     */
    height?: number;
    /**
     * Unit of measurement for width/height
     * @default 'px'
     */
    measurementUnit?: '%' | 'px';
  };
}

/**
 * Configuration for Jump To Dashboard functionality for pivot widgets.
 * Used for pivot widgets, allowing to configure jumping to different dashboard from different dimensions
 * @see {@link JumpToDashboardConfig}
 */
export interface JumpToDashboardConfigForPivot extends Omit<JumpToDashboardConfig, 'targets'> {
  /**
   * Map of target dashboards for different dimensions/measures
   *
   * @alpha
   * @example
   *
   * const FormulaMeasure = dashboardProps.widgets[0].dataOptions.values[0];
   * const ageRangeAttribute = dashboardProps.widgets[0].dataOptions.rows[1];
   *
   * const targets = new Map([
   *    [ageRangeAttribute, [target, target2]],
   *    [FormulaMeasure, [target3]],
   * ]);
   *
   */
  targets: Map<
    Attribute | { dimension: Attribute; location: 'row' | 'column' | 'value' } | Measure,
    JtdTarget[]
  >;
}

/**
 * Target dashboard for Jump To Dashboard functionality.
 * Supports both dashboard ID reference and in-code dashboard object.
 * @see JumpToDashboardConfig
 * @see DashboardProps
 */
export type JtdTarget =
  | {
      caption: string;
      id: string;
    }
  | {
      caption: string;
      dashboard: DashboardProps;
    };

/**
 * Type guard to check if a jump target contains dashboard props
 * @internal
 */
export const isJumpTargetWithDashboardProps = (
  target: JtdTarget,
): target is { caption: string; dashboard: DashboardProps } => {
  return 'dashboard' in target;
};

/**
 * Type guard to check if a jump target contains dashboard ID
 * @internal
 */
export const isJumpTargetWithId = (
  target: JtdTarget,
): target is { caption: string; id: string } => {
  return 'id' in target;
};

/**
 * @internal
 */
export type PivotDimType = 'columns' | 'rows' | 'values';

/**
 * @internal
 */
export type NonNegativeIntString = Exclude<`${bigint}`, `-${string}`>; // "0", "1", "2", ...

/**
 * Pivot dimension ID
 * example: "columns.0", "rows.0", "values.0", "columns.1", "rows.1", "values.1", etc.
 * @internal
 */
export type PivotDimId = `${PivotDimType}.${NonNegativeIntString}`;

export type JtdTargetDto = {
  caption: string;
  id?: string;
  oid?: string;
};

export type JtdPivotTargetDto = JtdTargetDto & {
  pivotDimensions: string[];
};

/**
 * Legacy representation of JTD config from Fusion
 * @internal
 */
export type JtdConfigDto = {
  drilledDashboardPrefix: string;
  drilledDashboardsFolderPrefix: string;
  displayFilterPane: boolean;
  displayDashboardsPane: boolean;
  displayToolbarRow: boolean;
  displayHeaderRow: boolean;
  volatile: boolean;
  hideDrilledDashboards: boolean;
  hideSharedDashboardsForNonOwner: boolean;
  drillToDashboardRightMenuCaption: string;
  drillToDashboardNavigateType: number;
  drillToDashboardNavigateTypePivot: number;
  drillToDashboardNavigateTypeCharts: number;
  drillToDashboardNavigateTypeOthers: number;
  drilledDashboardDisplayType: number;
  dashboardIds: Array<JtdTargetDto | JtdPivotTargetDto>;
  modalWindowResize: boolean;
  modalWindowMeasurement?: 'px' | '%';
  modalWindowWidth?: number;
  modalWindowHeight?: number;
  showFolderNameOnMenuSelection: boolean;
  resetDashFiltersAfterJTD: boolean;
  sameCubeRestriction: boolean;
  showJTDIcon?: boolean;
  sendPieChartMeasureFiltersOnClick: boolean;
  forceZeroInsteadNull: boolean;
  mergeTargetDashboardFilters: boolean;
  drillToDashboardByName: boolean;
  sendBreakByValueFilter: boolean;
  ignoreFiltersSource: boolean;
  sendFormulaFiltersDuplicate?: number | 'none' | undefined;
  enabled?: boolean;
  version?: string;
  includeDashFilterDims?: string[];
  includeWidgetFilterDims?: string[];
};

/**
 * Jump To Dashboard action trigger method type
 * click - when user clicks on the widget
 * rightclick - when user right clicks on the widget, opening the context menu
 * @see {@link JumpToDashboardConfig}
 */
export type TriggerMethod = 'click' | 'rightclick';

/**
 * @internal
 */
export type JtdTargetInner = JtdTarget & {
  pivotDimensions?: PivotDimId[];
};

/**
 * Internal representation of Jump To Dashboard configuration object.
 * This is the legacy format that includes fields like drilledDashboardPrefix
 * and modalWindowResize that don't have direct equivalents in JumpToDashboardConfig.
 * @internal
 */
export type JtdConfig = {
  jumpedDashboardPrefix?: string;
  dashboardConfig?: DashboardConfig;
  jumpToDashboardRightMenuCaption?: string;
  navigateType?: TriggerMethod;
  includeDashFilterDims?: string[];
  includeWidgetFilterDims?: string[];
  jumpTargets: Array<JtdTargetInner>;
  modalWindowResize?: boolean;
  modalWindowMeasurement?: 'px' | '%';
  modalWindowWidth?: number;
  modalWindowHeight?: number;
  showJtdIcon?: boolean;
  mergeTargetDashboardFilters?: boolean;
  sendFormulaFiltersDuplicate?: number | 'none' | undefined;
  enabled?: boolean;
  extraFilters?: Filter[];
};
