import { Layout } from '@/models';
import { Filter, FilterRelations } from '@sisense/sdk-data';

export const cellDivStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'clip',
};

export const cellSelectedStyle = {
  borderColor: 'green',
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
  dashboardLayout: Layout,
  cellSpacing: number,
  layoutWidth: number,
) => {
  const layout: any = [];
  if (!dashboardLayout?.columns) return layout;

  const maxRows = dashboardLayout.columns.reduce(
    (maxValue, c) => Math.max(maxValue, c.cells.length),
    0,
  );

  let columnWidthAccumlation = 0;
  dashboardLayout.columns.forEach((c: any, cindex) => {
    const columnWidthPercent = c.width / 100.0;
    const columnWidth = columnWidthPercent * layoutWidth;
    let columnSubCellVirticalPosition = 0;

    const extraHeight = ((maxRows - c.cells.length) * cellSpacing) / c.cells.length;

    c.cells.forEach((c: any) => {
      let maxSubcellHeight = 0;
      let columnSubCellsWidthAccumlation = columnWidthAccumlation;
      c.subcells.forEach((sc: any) => {
        const subcellHeight = `${sc.elements[0].height}`;
        const subcellId = sc.elements[0].widgetid;
        const subcellHightPx = parseInt(subcellHeight.replace('px', '')) + 32;
        const subcellWidthPct = (columnWidthPercent * sc.width) / 100.0;
        const subcellWidth = layoutWidth * subcellWidthPct;
        layout.push({
          c: cindex,
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
