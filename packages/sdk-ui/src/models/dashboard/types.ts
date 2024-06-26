import { CommonFiltersOptions } from '@/common-filters/types';

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
