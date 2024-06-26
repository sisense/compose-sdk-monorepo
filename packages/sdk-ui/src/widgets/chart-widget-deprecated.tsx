/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useMemo, useState, type FunctionComponent } from 'react';

import { Chart } from '../chart';
import {
  CompleteThemeSettings,
  MenuPosition,
  ChartDataPoint,
  ChartDataPointEventHandler,
  ChartDataPoints,
} from '../types';
import { ChartDataPointsEventHandler, ChartWidgetProps } from '../props';
import { ContextMenu } from './common/context-menu';
import { useWidgetDrilldown } from './common/use-widget-drilldown';
import { WidgetHeader } from './common/widget-header';
import { ThemeProvider, useThemeContext } from '../theme-provider';
import { WidgetCornerRadius, WidgetSpaceAround, getShadowValue } from './common/widget-style-utils';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getWidgetDefaultSize } from '../dynamic-size-container';
import { getDataSourceName } from '@sisense/sdk-data';

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
 *     value: [measureFactory.sum(DM.Commerce.Revenue)],
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
export const ChartWidgetDeprecated: FunctionComponent<ChartWidgetProps> = asSisenseComponent({
  componentName: 'ChartWidgetDeprecated',
})((props) => {
  const [contextMenuPos, setContextMenuPos] = useState<null | MenuPosition>(null);

  const [refreshCounter, setRefreshCounter] = useState(0);
  const hasDrilldownOptions =
    props.drilldownOptions?.drilldownDimensions?.length ||
    props.drilldownOptions?.drilldownSelections?.length;

  // drilldown is not supported for scatter charts or filterRelations or when not drilldown configuration was set
  if (hasDrilldownOptions && props.chartType !== 'scatter' && Array.isArray(props.filters)) {
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

    styleOptions,
    ...restProps
  } = props;

  const { themeSettings } = useThemeContext();

  const closeContextMenu = useCallback(() => {
    setContextMenuPos(null);
    onContextMenuClose?.();
  }, [setContextMenuPos, onContextMenuClose]);

  const defaultSize = getWidgetDefaultSize(props.chartType, {
    hasHeader: !styleOptions?.header?.hidden,
  });
  const { width, height, ...styleOptionsWithoutSizing } = styleOptions || {};

  const chartProps = {
    ...restProps,
    dataSet: dataSource,
    styleOptions: styleOptionsWithoutSizing,
    onDataPointContextMenu: useMemo(
      () =>
        contextMenuItems
          ? (point: ChartDataPoint, nativeEvent: PointerEvent) => {
              (onDataPointContextMenu as ChartDataPointEventHandler | undefined)?.(
                point,
                nativeEvent,
              );
              const { clientX: left, clientY: top } = nativeEvent;
              setContextMenuPos({ left, top });
            }
          : onDataPointContextMenu,
      [contextMenuItems, onDataPointContextMenu, setContextMenuPos],
    ),
    onDataPointsSelected: useMemo(
      () =>
        contextMenuItems
          ? (points: ChartDataPoints, nativeEvent: MouseEvent) => {
              (onDataPointsSelected as ChartDataPointsEventHandler | undefined)?.(
                points,
                nativeEvent,
              );
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
            padding: WidgetSpaceAround[styleOptions?.spaceAround || 'None'],
          }}
        >
          <div
            className={'csdk-h-full csdk-overflow-hidden'}
            style={{
              borderWidth: styleOptions?.border ? '1px' : 0,
              borderColor: styleOptions?.borderColor || themeSettings.chart.textColor,
              borderRadius: styleOptions?.cornerRadius
                ? WidgetCornerRadius[styleOptions.cornerRadius]
                : 0,
              boxShadow: getShadowValue(styleOptions),
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!styleOptions?.header?.hidden && (
              <WidgetHeader
                title={title}
                description={description}
                dataSetName={chartProps.dataSet ? getDataSourceName(chartProps.dataSet) : undefined}
                styleOptions={styleOptions?.header}
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
              theme={
                {
                  chart: {
                    backgroundColor:
                      styleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
                  },
                } as CompleteThemeSettings
              }
              skipTracking={true}
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
