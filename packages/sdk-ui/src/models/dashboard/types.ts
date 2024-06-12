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
