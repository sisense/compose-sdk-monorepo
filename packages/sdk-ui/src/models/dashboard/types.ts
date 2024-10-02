import { CommonFiltersOptions } from '@/common-filters/types';
import { ColorPaletteTheme } from '@/types';

export type {
  CommonFiltersOptions,
  CommonFiltersApplyMode,
  FiltersIgnoringRules,
} from '@/common-filters/types';

/**
 * Column layout of dashboard widgets
 */
export interface WidgetsPanelColumnLayout {
  columns: {
    widthPercentage: number;
    rows: {
      cells: {
        widthPercentage: number;
        /**
         * @privateRemarks
         * This value appears to be overwritten by the widget's height property.
         * Marking as optional and internal for now.
         * @internal
         */
        height?: number | string;
        widgetId: string;
      }[];
    }[];
  }[];
}

/**
 * Layout of dashboard widgets panel, which is a union of different layout algorithms
 */
export type WidgetsPanelLayout = WidgetsPanelColumnLayout;

export type WidgetId = string;
/**
 * Options for widgets in a dashboard
 *
 * For example, how common filters defined at the dashboard level should be applied to widgets.
 */
export type WidgetsOptions = Record<WidgetId, { filtersOptions?: CommonFiltersOptions }>;

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
