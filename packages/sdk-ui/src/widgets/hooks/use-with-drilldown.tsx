/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useMemo } from 'react';
import { Filter, createAttribute } from '@sisense/sdk-data';
import { DataPoint, DrilldownSelection, ScatterDataPoint } from '../../types.js';
import { ChartWidgetProps } from '@/props.js';
import { useMenu } from '@/common/hooks/use-menu.js';
import { useDrilldown } from './use-drilldown.js';
import { useSyncedDrilldownPaths } from './use-synced-hierarchies.js';
import {
  applyDrilldownDimension,
  getDrilldownInitialDimension,
  isDrilldownApplicableToChart,
  prepareDrilldownSelectionPoints,
} from '../common/drilldown-utils.js';
import { mergeFilters } from '@/dashboard-widget/utils.js';
import { combineHandlers } from '@/utils/combine-handlers.js';

type UseWithDrilldownParams = {
  propsToExtend: ChartWidgetProps;
  onDrilldownSelectionsChange?: (selections: DrilldownSelection[]) => void;
};

export const useWithDrilldown = ({
  propsToExtend,
  onDrilldownSelectionsChange,
}: UseWithDrilldownParams) => {
  const { chartType, dataOptions, dataSource, drilldownOptions } = propsToExtend;
  const { drilldownSelections } = drilldownOptions || {};
  const { openMenu } = useMenu();

  const isDrilldownApplicable = useMemo(
    () => isDrilldownApplicableToChart(chartType, dataOptions),
    [chartType, dataOptions],
  );
  const initialDrilldownPaths = useMemo(
    () => [
      ...(drilldownOptions?.drilldownPaths || []),
      ...(drilldownOptions?.drilldownDimensions || []),
    ],
    [drilldownOptions?.drilldownPaths, drilldownOptions?.drilldownDimensions],
  );
  const initialDimension = useMemo(() => {
    const dummyAttribute = createAttribute({ name: 'dummy drilldown initial attribute' });
    return getDrilldownInitialDimension(chartType, dataOptions) || dummyAttribute;
  }, [chartType, dataOptions]);

  const drilldownPaths = useSyncedDrilldownPaths({
    attribute: initialDimension,
    dataSource: dataSource,
    drilldownPaths: initialDrilldownPaths,
    enabled: isDrilldownApplicable,
  });

  const isDrilldownEnabled = useMemo(() => {
    const hasDrilldownConfig =
      drilldownOptions?.drilldownSelections?.length ||
      drilldownOptions?.drilldownDimensions?.length ||
      drilldownPaths?.length;

    return hasDrilldownConfig && isDrilldownApplicable;
  }, [drilldownOptions, isDrilldownApplicable, drilldownPaths]);

  const { drilldownDimension, drilldownFilters, breadcrumbs, openDrilldownMenu } = useDrilldown({
    initialDimension,
    drilldownSelections,
    drilldownPaths,
    openMenu,
    onDrilldownSelectionsChange,
  });

  const drilldownOnDataPointsSelected = useCallback(
    (points: (DataPoint | ScatterDataPoint)[], event: MouseEvent) => {
      const drilldownSelectionPoints = prepareDrilldownSelectionPoints(points, event, dataOptions);
      openDrilldownMenu(
        {
          left: event.clientX,
          top: event.clientY,
        },
        drilldownSelectionPoints,
      );
    },
    [dataOptions, openDrilldownMenu],
  );

  const drilldownOnDataPointContextMenu = useCallback(
    (point: DataPoint, event: MouseEvent) => {
      const drilldownSelectionPoints = prepareDrilldownSelectionPoints([point], event, dataOptions);
      openDrilldownMenu(
        {
          left: event.clientX,
          top: event.clientY,
        },
        drilldownSelectionPoints,
      );
    },
    [dataOptions, openDrilldownMenu],
  );

  /**
   * Connecting drilldown to props:
   */
  const dataOptionsWithDrilldown = useMemo(() => {
    return applyDrilldownDimension(chartType, dataOptions, drilldownDimension);
  }, [chartType, dataOptions, drilldownDimension]);

  const filtersWithDrilldown = useMemo(() => {
    return drilldownFilters.length
      ? // todo: cover filter relations case
        mergeFilters(propsToExtend.filters as Filter[], drilldownFilters)
      : propsToExtend.filters;
  }, [propsToExtend.filters, drilldownFilters]);

  const onDataPointsSelectedWithDrilldown = useMemo(
    () => combineHandlers([drilldownOnDataPointsSelected, propsToExtend.onDataPointsSelected]),
    [drilldownOnDataPointsSelected, propsToExtend.onDataPointsSelected],
  );

  const onDataPointContextMenuWithDrilldown = useMemo(
    () => combineHandlers([drilldownOnDataPointContextMenu, propsToExtend.onDataPointContextMenu]),
    [drilldownOnDataPointContextMenu, propsToExtend.onDataPointContextMenu],
  );

  const propsWithDrilldown = {
    ...propsToExtend,
    ...(isDrilldownEnabled && {
      dataOptions: dataOptionsWithDrilldown,
      filters: filtersWithDrilldown,
      onDataPointsSelected: onDataPointsSelectedWithDrilldown,
      onDataPointContextMenu: onDataPointContextMenuWithDrilldown,
    }),
  } as ChartWidgetProps;

  return {
    propsWithDrilldown,
    isDrilldownEnabled,
    breadcrumbs,
  };
};
