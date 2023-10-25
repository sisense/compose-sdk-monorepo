/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-lines */
import React, { useCallback, useMemo, useState, type FunctionComponent } from 'react';

import { Chart } from '../chart';
import { DataPoint, MenuPosition } from '../types';
import { ChartWidgetProps } from '../props';
import { ContextMenu } from './common/context-menu';
import { useWidgetDrilldown } from './common/use-widget-drilldown';
import { WidgetHeader } from './common/widget-header';
import { ThemeProvider, useThemeContext } from '../theme-provider';
import { WidgetCornerRadius, WidgetSpaceAround, getShadowValue } from './common/widget-style-utils';
import { asSisenseComponent } from '../decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';

/**
 * The Chart Widget component extending the {@link Chart} component to support advanced BI
 * capabilities such as drilldown.
 *
 * @example
 * Example of using the `ChartWidget` component to
 * plot a bar chart of the `Sample ECommerce` data source hosted in a Sisense instance.
 * Drill-down capability is enabled.
 * ```tsx
 * <ChartWidget
 *   dataSource={DM.DataSource}
 *   chartType="bar"
 *   dataOptions={{
 *     category: [DM.Category.Category],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [],
 *   }}
 *   drilldownOptions={{
 *     drilldownDimensions: [DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition],
 *   }}
 * />
 * ```
 *
 * <img src="media://chart-widget-with-drilldown-example-1.png" width="800px" />
 * @param props - ChartWidget properties
 * @returns ChartWidget component representing a chart type as specified in `ChartWidgetProps.`{@link ChartWidgetProps.chartType}
 */
export const ChartWidget: FunctionComponent<ChartWidgetProps> = asSisenseComponent({
  componentName: 'ChartWidget',
})((props) => {
  const [contextMenuPos, setContextMenuPos] = useState<null | MenuPosition>(null);

  const [refreshCounter, setRefreshCounter] = useState(0);

  // drilldown is not supported for scatter charts
  if (props.chartType !== 'scatter') {
    props = useWidgetDrilldown(props);
  }

  const {
    onDataPointContextMenu,
    onDataPointsSelected,
    onContextMenuClose,
    dataSource,
    topSlot,
    bottomSlot,
    contextMenuItems,
    title,
    description,
    widgetStyleOptions,
    styleOptions,
    ...restProps
  } = props;

  const { themeSettings } = useThemeContext();

  const closeContextMenu = useCallback(() => {
    setContextMenuPos(null);
    onContextMenuClose?.();
  }, [setContextMenuPos, onContextMenuClose]);

  const defaultSize = getWidgetDefaultSize(props.chartType, {
    hasHeader: !widgetStyleOptions?.header?.hidden,
  });
  const { width, height, ...styleOptionsWithoutSizing } = styleOptions || {};

  const chartProps = {
    ...restProps,
    dataSet: dataSource,
    styleOptions: styleOptionsWithoutSizing,
    onDataPointContextMenu: useMemo(
      () =>
        contextMenuItems
          ? (point: DataPoint, nativeEvent: PointerEvent) => {
              if (onDataPointContextMenu?.(point, nativeEvent)) {
                return;
              }
              const { clientX: left, clientY: top } = nativeEvent;
              setContextMenuPos({ left, top });
            }
          : onDataPointContextMenu,
      [contextMenuItems, onDataPointContextMenu, setContextMenuPos],
    ),
    onDataPointsSelected: useMemo(
      () =>
        contextMenuItems
          ? (points: DataPoint[], nativeEvent: MouseEvent) => {
              if (onDataPointsSelected?.(points, nativeEvent)) {
                return;
              }
              const { clientX: left, clientY: top } = nativeEvent;
              setContextMenuPos({ left, top });
            }
          : onDataPointsSelected,
      [contextMenuItems, onDataPointsSelected, setContextMenuPos],
    ),
  };

  if (!props.chartType || !props.dataOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width,
        height,
      }}
    >
      <div className={'csdk-w-full csdk-h-full csdk-overflow-hidden'}>
        <div
          className={'csdk-h-full'}
          style={{
            padding: WidgetSpaceAround[widgetStyleOptions?.spaceAround || 'None'],
          }}
        >
          <div
            className={'csdk-h-full csdk-overflow-hidden'}
            style={{
              borderWidth: widgetStyleOptions?.border ? '1px' : 0,
              borderColor: widgetStyleOptions?.borderColor || themeSettings.chart.textColor,
              borderRadius: widgetStyleOptions?.cornerRadius
                ? WidgetCornerRadius[widgetStyleOptions.cornerRadius]
                : 0,
              boxShadow: getShadowValue(widgetStyleOptions),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!widgetStyleOptions?.header?.hidden && (
              <WidgetHeader
                title={title}
                description={description}
                dataSetName={chartProps.dataSet}
                styleOptions={widgetStyleOptions?.header}
                onRefresh={() => setRefreshCounter(refreshCounter + 1)}
              />
            )}
            {topSlot}

            <ContextMenu
              position={contextMenuPos}
              itemSections={contextMenuItems}
              closeContextMenu={closeContextMenu}
            />
            <ThemeProvider
              theme={{
                chart: {
                  backgroundColor:
                    widgetStyleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
                },
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  // prevents 'auto' behavior of using content size as minimal size for container
                  minWidth: 0,
                  minHeight: 0,
                }}
              >
                <Chart {...chartProps} refreshCounter={refreshCounter} />
              </div>
            </ThemeProvider>

            {bottomSlot}
          </div>
        </div>
      </div>
    </DynamicSizeContainer>
  );
});
