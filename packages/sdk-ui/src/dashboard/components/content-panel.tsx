import { isPivotWidget, isTableWidget, isTextWidget } from '@/dashboard-widget/utils';
import { getDividerStyle } from '@/dashboard/utils';
import { DynamicSizeContainer, getWidgetDefaultSize } from '@/dynamic-size-container';
import { CompleteThemeSettings, useThemeContext } from '@/index';
import { Layout, WidgetModel } from '@/models';
import {
  ChartWidgetProps,
  PivotTableWidgetProps,
  TableWidgetProps,
  TextWidgetProps,
} from '@/props';
import { ChartWidget } from '@/widgets/chart-widget';
import { WidgetContainer } from '@/widgets/common/widget-container';
import { PivotTableWidget } from '@/widgets/pivot-table-widget';
import { TableWidget } from '@/widgets/table-widget';
import { TextWidget } from '@/widgets/text-widget';
import styled from '@emotion/styled';
import { usePlugins } from '@/plugins-provider';
import { WidgetPlugin } from '@/plugins-provider/types';
import ErrorBoundaryBox from '@/error-boundary/error-boundary-box';

const Row = styled.div<{ widths: number[] }>`
  display: grid;
  grid-template-columns: ${({ widths }) => widths.map((w) => `${w}%`).join(' ')};
`;

const Column = styled.div<{
  dividerWidth: number;
  dividerColor: string;
}>`
  &:not(:first-of-type) {
    border-left: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  }
`;

const Subcell = styled.div<{
  height: string | number;
  dividerWidth: number;
  dividerColor: string;
}>`
  border-bottom: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  &:not(:first-of-type) {
    border-left: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  }
  height: ${({ height }) => `calc(${height} + 32px)`};
`;

function getWidgetProps(widgetModel: WidgetModel) {
  const { widgetType } = widgetModel;
  if (isTableWidget(widgetType)) {
    return widgetModel.getTableWidgetProps();
  } else if (isPivotWidget(widgetType)) {
    return widgetModel.getPivotTableWidgetProps();
  } else if (isTextWidget(widgetType)) {
    return widgetModel.getTextWidgetProps();
  } else {
    return widgetModel.getChartWidgetProps();
  }
}

const renderWidgetModel = (
  w: WidgetModel | undefined,
  theme: CompleteThemeSettings,
  plugins: Map<string, WidgetPlugin>,
) => {
  if (!w) {
    return null;
  }

  if (w.widgetType === 'plugin') {
    const plugin = plugins.get(w.pluginType);
    if (!plugin) {
      return (
        <ErrorBoundaryBox
          error={`Unknown plugin type: ${w.pluginType}. Please register this plugin so it can be rendered.`}
        />
      );
    }
    const { component: PluginComponent } = plugin;
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
          <PluginComponent key={`plugin-${w.oid}`} {...pluginChartProps} />
        </WidgetContainer>
      </DynamicSizeContainer>
    );
  }

  const chartProps = getWidgetProps(w);

  if (isTableWidget(w.widgetType)) {
    return <TableWidget {...(chartProps as TableWidgetProps)} />;
  } else if (isPivotWidget(w.widgetType)) {
    return <PivotTableWidget {...(chartProps as PivotTableWidgetProps)} />;
  } else if (isTextWidget(w.widgetType)) {
    return <TextWidget {...(chartProps as TextWidgetProps)} />;
  } else {
    return <ChartWidget {...(chartProps as ChartWidgetProps)} highlightSelectionDisabled={true} />;
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
  const { plugins } = usePlugins();
  return (
    <Row widths={layout.columns.map((c) => c.widthPercentage)}>
      {layout.columns.map((column, columnIndex) => (
        <Column
          key={columnIndex}
          dividerWidth={themeSettings.dashboard.dividerLineWidth}
          dividerColor={themeSettings.dashboard.dividerLineColor}
        >
          {column.rows?.map((row, cellIndex) => (
            <Row
              key={`${columnIndex},${cellIndex}`}
              widths={row.cells.map((sb) => sb.widthPercentage)}
            >
              {row.cells.map((subcell) => (
                <Subcell
                  key={`${subcell.widgetId},${subcell.widthPercentage}`}
                  height={subcell.height}
                  dividerWidth={themeSettings.dashboard.dividerLineWidth}
                  dividerColor={themeSettings.dashboard.dividerLineColor}
                >
                  {renderWidgetModel(
                    widgets.find((w) => w.oid === subcell.widgetId),
                    themeSettings,
                    plugins,
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
