import styled from '@emotion/styled';
import { isPivotWidget, isTableWidget } from './dashboard-widget/utils';
import { Layout, WidgetModel } from './models';
import { ChartWidgetProps, PivotTableWidgetProps, TableWidgetProps } from './props';
import { ChartWidget } from './widgets/chart-widget';
import { PivotTableWidget } from './widgets/pivot-table-widget';
import { TableWidget } from './widgets/table-widget';

const DIVIDER_STYLE = '1px solid rgba(38, 46, 61, 0.1)';

const Row = styled.div<{ widths: number[] }>`
  display: grid;
  grid-template-columns: ${({ widths }) => widths.map((w) => `${w}%`).join(' ')};
  &:last-of-type {
    border-bottom: ${DIVIDER_STYLE};
  }
`;

const Column = styled.div`
  border-left: ${DIVIDER_STYLE};
  &:last-of-type {
    border-right: ${DIVIDER_STYLE};
  }
`;

const Subcell = styled.div<{ height: string | number }>`
  border-top: ${DIVIDER_STYLE};
  &:not(:first-of-type) {
    border-left: ${DIVIDER_STYLE};
  }
  height: ${({ height }) => `calc(${height} + 32px)`};
`;

function getWidgetProps(widgetModel: WidgetModel) {
  const { widgetType } = widgetModel;
  if (isTableWidget(widgetType)) {
    return widgetModel.getTableWidgetProps();
  } else if (isPivotWidget(widgetType)) {
    return widgetModel.getPivotTableWidgetProps();
  } else {
    return widgetModel.getChartWidgetProps();
  }
}

const renderWidgetModel = (w: WidgetModel | undefined) => {
  if (!w) {
    return null;
  }

  const chartProps = getWidgetProps(w);

  if (isTableWidget(w.widgetType)) {
    return <TableWidget {...(chartProps as TableWidgetProps)} />;
  } else if (isPivotWidget(w.widgetType)) {
    return <PivotTableWidget {...(chartProps as PivotTableWidgetProps)} />;
  } else {
    return <ChartWidget {...(chartProps as ChartWidgetProps)} />;
  }
};

/**
 * Props for the {@link ContentPanel} component.
 *
 * @internal
 */
export interface ContentPanelProps {
  /**
   * An object defining how the widgets should be laid out.
   */
  layout: Layout;

  /**
   * A list of widget models to render.
   */
  widgets: WidgetModel[];
}

/**
 * A React component used for rendering a layout of widgets.
 *
 * @example
 * Example of using the component with the useGetDashboardModel hook:
 * ```tsx
 * const { dashboard, isLoading, isError } = useGetDashboardModel({
 *   dashboardOid: 'dashboard-oid',
 *   includeWidgets: true,
 * });
 *
 * const { layout, widgets } = dashboard;
 * if (!layout || !widgets) return null;
 *
 * return (
 *   <ContentPanel
 *     layout={layout}
 *     widgets={widgets}
 *   />
 * );
 * ```
 * @param props - {@link ContentPanelProps}
 * @internal
 */
export const ContentPanel = ({ layout, widgets }: ContentPanelProps) => {
  return (
    <Row widths={layout.columns.map((c) => c.widthPercentage)}>
      {layout.columns.map((column, columnIndex) => (
        <Column key={columnIndex}>
          {column.cells.map((cell, cellIndex) => (
            <Row
              key={`${columnIndex},${cellIndex}`}
              widths={cell.subcells.map((sb) => sb.widthPercentage)}
            >
              {cell.subcells.map((subcell) => (
                <Subcell
                  key={`${subcell.widgetId},${subcell.widthPercentage}`}
                  height={subcell.height}
                >
                  {renderWidgetModel(widgets.find((w) => w.oid === subcell.widgetId))}
                </Subcell>
              ))}
            </Row>
          ))}
        </Column>
      ))}
    </Row>
  );
};
