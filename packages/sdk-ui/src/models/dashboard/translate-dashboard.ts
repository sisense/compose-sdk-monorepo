import type { DashboardDto, Layout as SisenseLayout } from '../../api/types/dashboard-dto';
import { translateWidget } from '../widget/translate-widget';
import type { Layout, DashboardModel } from './types';

export const translateLayout = (layout: SisenseLayout): Layout => ({
  columns: layout.columns.map((c) => ({
    widthPercentage: c.width,
    cells: c.cells.map((cell) => ({
      subcells: cell.subcells.map((subcell) => ({
        widthPercentage: subcell.width,
        height: subcell.elements[0].height,
        widgetId: subcell.elements[0].widgetid,
      })),
    })),
  })),
});

export function translateDashboard({
  oid,
  title,
  datasource,
  widgets,
  layout,
}: DashboardDto): DashboardModel {
  return {
    oid,
    title,
    layout: layout && translateLayout(layout),
    dataSource: datasource.fullname ?? datasource.title,
    ...(widgets && {
      widgets: widgets.map(translateWidget),
    }),
  };
}
