/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
import React, { useCallback, useMemo, useState, type FunctionComponent } from 'react';

import { Chart } from '../components/Chart';
import { DataPoint, CompleteThemeSettings } from '../types';
import { ChartWidgetProps } from '../props';
import { ContextMenu, MenuPosition } from './common/ContextMenu';
import { useWidgetDrilldown } from './common/useWidgetDrilldown';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
import { WidgetHeader } from './common/WidgetHeader';
import { ThemeProvider, useThemeContext } from '../components/ThemeProvider';
import { WidgetCornerRadius, WidgetSpaceAround, getShadowValue } from './common/widgetStyleUtils';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * @internal
 */
export const UnwrappedChartWidget: FunctionComponent<ChartWidgetProps> = (props) => {
  const [contextMenuPos, setContextMenuPos] = useState<null | MenuPosition>(null);

  const [refreshCounter, setRefreshCounter] = useState(0);

  props = useWidgetDrilldown(props);

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
    ...restProps
  } = props;

  const { themeSettings } = useThemeContext();

  const closeContextMenu = useCallback(() => {
    setContextMenuPos(null);
    onContextMenuClose?.();
  }, [setContextMenuPos, onContextMenuClose]);

  const chartProps = {
    ...restProps,
    dataSet: dataSource,
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
    <div className={'w-full h-full overflow-hidden'}>
      <div
        style={{
          padding: WidgetSpaceAround[widgetStyleOptions?.spaceAround || 'None'],
        }}
      >
        <div
          className="overflow-hidden"
          style={{
            borderWidth: widgetStyleOptions?.border ? '1px' : 0,
            borderColor: widgetStyleOptions?.borderColor || themeSettings.chart.textColor,
            borderRadius: widgetStyleOptions?.cornerRadius
              ? WidgetCornerRadius[widgetStyleOptions.cornerRadius]
              : 0,
            boxShadow: getShadowValue(widgetStyleOptions),
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
            theme={
              {
                chart: {
                  backgroundColor:
                    widgetStyleOptions?.backgroundColor || themeSettings.chart?.backgroundColor,
                },
              } as CompleteThemeSettings
            }
          >
            <Chart {...chartProps} refreshCounter={refreshCounter} />
          </ThemeProvider>

          {bottomSlot}
        </div>
      </div>
    </div>
  );
};

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
 *     drilldownCategories: [DM.Commerce.AgeRange, DM.Commerce.Gender, DM.Commerce.Condition],
 *   }}
 * />
 * ```
 * ###
 * <img src="media://widget-with-drilldown-example-1.png" width="800px" />
 * @param props - ChartWidget properties
 * @returns ChartWidget component representing a chart type as specified in `ChartWidgetProps.`{@link ChartWidgetProps.chartType}
 */
export const ChartWidget: FunctionComponent<ChartWidgetProps> = (props) => {
  useTrackComponentInit('ChartWidget', props);

  return (
    <TrackingContextProvider>
      <ErrorBoundary>
        <UnwrappedChartWidget {...props} />
      </ErrorBoundary>
    </TrackingContextProvider>
  );
};
