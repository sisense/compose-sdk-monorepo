import { Layout as DashboardLayout } from '@/models/dashboard/types';
import { Filter, FilterRelations } from '@sisense/sdk-data';
import { Layout as GridLayout } from 'react-grid-layout';

export const cellDivStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'clip',
};

export const cellStyle = {
  width: '100%',
  height: '100%',
  overflow: 'clip',
  backgroundColor: 'white',
  alignItems: 'center',
  borderRadius: '16px',
  zIndex: '100',
};

export const getWidgetAndDashboardFilters = (
  optOut: { [key: string]: boolean },
  widgetFilters: Filter[] | FilterRelations | undefined,
  dashboardFilters: Filter[],
) => {
  return dashboardFilters
    .filter((f) => !optOut[f.attribute.name])
    .concat((widgetFilters as Filter[]) || []);
};

export const generateDashboardLayout = (
  dashboardLayout: DashboardLayout,
  cellSpacing: number,
  layoutWidth: number,
): GridLayout[] => {
  const layout: GridLayout[] = [];

  const maxRows = dashboardLayout.columns.reduce(
    (maxValue, column) => Math.max(maxValue, column.cells.length),
    0,
  );

  let columnWidthAccumlation = 0;
  dashboardLayout.columns.forEach((column: any) => {
    const columnWidthPercent = column.width / 100.0;
    const columnWidth = columnWidthPercent * layoutWidth;
    let columnSubCellVirticalPosition = 0;
    const extraHeight = ((maxRows - column.cells.length) * cellSpacing) / column.cells.length;

    column.cells.forEach((cell: any) => {
      let maxSubcellHeight = 0;
      let columnSubCellsWidthAccumlation = columnWidthAccumlation;
      cell.subcells.forEach((subcell: any) => {
        const subcellHeight = subcell.elements[0].height;
        const subcellId = subcell.elements[0].widgetid;
        const subcellHightPx = parseInt(`${subcellHeight}`.replace('px', '')) + 32;
        // if no widthPercent then assume cell takes full column width
        const widthPercent = subcell.width || 100.0;
        const subcellWidthPct = (columnWidthPercent * widthPercent) / 100.0;
        const subcellWidth = layoutWidth * subcellWidthPct;
        layout.push({
          x: columnSubCellsWidthAccumlation,
          y: columnSubCellVirticalPosition,
          w: subcellWidth,
          h: subcellHightPx + extraHeight,
          i: subcellId,
          static: true,
        });
        maxSubcellHeight = Math.max(maxSubcellHeight, subcellHightPx + cellSpacing + extraHeight);
        columnSubCellsWidthAccumlation += subcellWidth;
      });
      columnSubCellVirticalPosition += maxSubcellHeight;
    });
    columnWidthAccumlation += columnWidth;
  });
  return layout;
};
