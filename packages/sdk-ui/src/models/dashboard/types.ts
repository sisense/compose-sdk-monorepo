import { CommonFiltersOptions } from '@/common-filters/types';
import { ColorPaletteTheme } from '@/types';

export type {
  CommonFiltersOptions,
  CommonFiltersApplyMode,
  FiltersIgnoringRules,
} from '@/common-filters/types';

/**
 * Layout of a dashboard.
 */
export interface Layout {
  columns: {
    widthPercentage: number;
    rows: {
      cells: {
        widthPercentage: number;
        height: number | string;
        widgetId: string;
      }[];
    }[];
  }[];
}

/**
 * Options for how common filters defined at the dashboard level should be applied to widgets.
 */
export type WidgetFilterOptions = Record<string, CommonFiltersOptions>;

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
