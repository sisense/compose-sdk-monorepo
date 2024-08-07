import { isPivotWidget, isTableWidget } from '@/dashboard-widget/utils';
import { getDividerStyle } from '@/dashboard/utils';
import { DynamicSizeContainer, getWidgetDefaultSize } from '@/dynamic-size-container';
import { CompleteThemeSettings, useThemeContext } from '@/index';
import { Layout, WidgetModel } from '@/models';
import { ChartWidgetProps, PivotTableWidgetProps, TableWidgetProps } from '@/props';
import { ChartWidget } from '@/widgets/chart-widget';
import { WidgetContainer } from '@/widgets/common/widget-container';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { TableWidget } from '@/widgets/table-widget';
import styled from '@emotion/styled';
import { PluginService } from './plugin-service';

const DIVIDER_COLOR = '#f2f2f2';
const DIVIDER_WIDTH = 4;

const Row = styled.div<{ widths: number[] }>`
  display: grid;
  grid-template-columns: ${({ widths }) => widths.map((w) => `${w}%`).join(' ')};
`;

const Column = styled.div`
  &:not(:first-of-type) {
    border-left: ${getDividerStyle(DIVIDER_COLOR, DIVIDER_WIDTH)};
  }
`;

const Subcell = styled.div<{ height: string | number }>`
  border-bottom: ${getDividerStyle(DIVIDER_COLOR, DIVIDER_WIDTH)};
  &:not(:first-of-type) {
    border-left: ${getDividerStyle(DIVIDER_COLOR, DIVIDER_WIDTH)};
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

const renderWidgetModel = (w: WidgetModel | undefined, theme: CompleteThemeSettings) => {
  if (!w) {
    return null;
  }

  if (w.widgetType === 'plugin') {
    const plugin = PluginService.get(w.pluginType);
    if (!plugin) {
      console.error(`Unknown plugin type: ${w.pluginType}`);
      return;
    }
    const pluginChartProps = plugin.createChartProps(w, theme);
    return (
      <DynamicSizeContainer defaultSize={getWidgetDefaultSize('line', { hasHeader: true })}>
        <WidgetContainer
          title={w.title}
          description={w.description}
          dataSetName={w.dataSource}
          styleOptions={w.styleOptions}
          onRefresh={() => console.log('DEBUG refresh')}
        >
          <plugin.Plugin {...pluginChartProps} />
        </WidgetContainer>
      </DynamicSizeContainer>
    );
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
  const { themeSettings } = useThemeContext();
  return (
    <Row widths={layout.columns.map((c) => c.widthPercentage)}>
      {layout.columns.map((column, columnIndex) => (
        <Column key={columnIndex}>
          {column.rows?.map((row, cellIndex) => (
            <Row
              key={`${columnIndex},${cellIndex}`}
              widths={row.cells.map((sb) => sb.widthPercentage)}
            >
              {row.cells.map((subcell) => (
                <Subcell
                  key={`${subcell.widgetId},${subcell.widthPercentage}`}
                  height={subcell.height}
                >
                  {renderWidgetModel(
                    widgets.find((w) => w.oid === subcell.widgetId),
                    themeSettings,
                  )}
                </Subcell>
              ))}
            </Row>
          ))}
        </Column>
      ))}
    </Row>
  );
};
