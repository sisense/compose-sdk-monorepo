import { CommonFiltersOptions } from '@/common-filters/types';
import { ColorPaletteTheme } from '@/types';

/** @internal */
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

/** @internal */
export type WidgetFilterOptions = Record<string, CommonFiltersOptions>;

/** @internal */
export type DashboardStyleOptions = {
  palette?: ColorPaletteTheme;
};
