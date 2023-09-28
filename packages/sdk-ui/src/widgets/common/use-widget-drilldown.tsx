/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines-per-function */
import { useCallback, useState, useMemo } from 'react';

import { DataPoint } from '../../types';
import { Attribute, Filter } from '@sisense/sdk-data';

import {
  HighchartsOptionsInternal,
  HighchartsOptions,
} from '../../chart-options-processor/chart-options-service';
import { ChartWidgetProps } from '../../props';
import { useDrilldown } from './drilldown';
import { DrilldownBreadcrumbs } from './drilldown-breadcrumbs';
import { MenuItemSection } from '../../types';

const defaultDataOptions = { category: [], value: [], breakBy: [] };
const defaultFilters: Filter[] = [];

export const useWidgetDrilldown = (props: ChartWidgetProps): ChartWidgetProps => {
  const {
    dataOptions = defaultDataOptions,
    filters = defaultFilters,
    drilldownOptions,
    onDataPointContextMenu: _onDataPointContextMenu,
    onDataPointsSelected: _onDataPointsSelected,
    onBeforeRender: _onBeforeRender,
    ...restProps
  } = props;

  const [selectedDataPoints, setSelectedDataPoints] = useState<DataPoint[]>([]);

  const {
    selectDrilldown,
    clearDrilldownSelections,
    sliceDrilldownSelections,
    availableDrilldowns,
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension,
    dataOptionsWithDrilldown,
  } = useDrilldown(dataOptions, drilldownOptions);

  const onMenuDrilldownClick = useCallback(
    (selectedPoints: DataPoint[], nextDimension: Attribute) => {
      selectDrilldown(selectedPoints, nextDimension);
    },
    [selectDrilldown],
  );

  const onDataPointContextMenu = useMemo(
    () =>
      drilldownOptions
        ? (point: DataPoint, nativeEvent: PointerEvent) => {
            if (_onDataPointContextMenu?.(point, nativeEvent)) {
              return;
            }
            setSelectedDataPoints([point]);
          }
        : _onDataPointContextMenu,
    [drilldownOptions, _onDataPointContextMenu, setSelectedDataPoints],
  );

  const onDataPointsSelected = useMemo(
    () =>
      drilldownOptions
        ? (points: DataPoint[], nativeEvent: MouseEvent) => {
            if (_onDataPointsSelected?.(points, nativeEvent)) {
              return;
            }
            setSelectedDataPoints(points);
          }
        : _onDataPointsSelected,
    [drilldownOptions, _onDataPointsSelected, setSelectedDataPoints],
  );

  const chartFilters = useMemo(() => filters.concat(drilldownFilters), [filters, drilldownFilters]);

  const applyPointSelections = useMemo(() => {
    if (!selectedDataPoints.length) {
      return undefined;
    }

    const categoryValueMap = selectedDataPoints.reduce((accu, { categoryValue }) => {
      if (categoryValue) {
        accu[`${categoryValue}`] = true;
      }
      return accu;
    }, {});

    return (options: HighchartsOptionsInternal) => ({
      ...options,
      series: options.series.map((s) => ({
        ...s,
        data: s.data.map((d) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          categoryValueMap[d.custom?.xValue?.[0]] ? d : { ...d, selected: true },
        ),
      })),
    });
  }, [selectedDataPoints]);

  const onBeforeRender = useCallback(
    (options: HighchartsOptions) => {
      options =
        (applyPointSelections?.(options as HighchartsOptionsInternal) as HighchartsOptions) ??
        options;
      options = _onBeforeRender?.(options) ?? options;
      return options;
    },
    [_onBeforeRender, applyPointSelections],
  );

  const contextMenuItems = useMemo(() => {
    if (drilldownOptions) {
      const drillDownMenuItems: MenuItemSection[] = [
        ...(drilldownDimension ? [{ sectionTitle: drilldownDimension?.name }] : []),
        ...(selectedDataPoints.length
          ? [
              {
                sectionTitle: 'Drill',
                items: availableDrilldowns.map((dd) => ({
                  caption: dd.name,
                  onClick: () => onMenuDrilldownClick(selectedDataPoints, dd),
                })),
              },
            ]
          : []),
      ];
      return drillDownMenuItems.concat(restProps.contextMenuItems ?? []);
    }

    return restProps.contextMenuItems;
  }, [
    restProps.contextMenuItems,
    drilldownOptions,
    drilldownDimension,
    selectedDataPoints,
    availableDrilldowns,
    onMenuDrilldownClick,
  ]);

  const onContextMenuClose = () => {
    restProps.onContextMenuClose?.();
    setSelectedDataPoints([]);
  };

  return {
    ...restProps,
    dataOptions: dataOptionsWithDrilldown,
    onDataPointContextMenu,
    onDataPointsSelected,
    filters: chartFilters,
    onBeforeRender,
    topSlot: (
      <>
        {restProps.topSlot}
        {drilldownDimension && (
          <DrilldownBreadcrumbs
            filtersDisplayValues={drilldownFiltersDisplayValues}
            currentDimension={drilldownDimension}
            clearDrilldownSelections={clearDrilldownSelections}
            sliceDrilldownSelections={sliceDrilldownSelections}
          />
        )}
      </>
    ),
    contextMenuItems,
    onContextMenuClose,
  };
};
