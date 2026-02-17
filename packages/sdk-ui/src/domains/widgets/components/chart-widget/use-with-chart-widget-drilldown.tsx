/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { createAttribute } from '@sisense/sdk-data';

import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu.js';
import { combineHandlers } from '@/shared/utils/combine-handlers.js';
import { mergeFiltersOrFilterRelations } from '@/shared/utils/filter-relations.js';
import { DataPoint, DrilldownSelection, ScatterDataPoint } from '@/types.js';

import {
  applyDrilldownDimension,
  getAvailableDrilldownPaths,
  getDrilldownInitialDimension,
  getSelectedDrilldownAttributes,
  isDrilldownApplicableToChart,
  prepareDrilldownSelectionPoints,
} from '../../../drilldown/drilldown-utils.js';
import { useDrilldown } from '../../../drilldown/hooks/use-drilldown.js';
import { useSyncedDrilldownPaths } from '../../../drilldown/hooks/use-synced-drilldown-paths.js';
import { ChartWidgetProps } from './types';

type UseWithChartWidgetDrilldownParams = {
  propsToExtend: ChartWidgetProps;
  onDrilldownSelectionsChange?: (selections: DrilldownSelection[]) => void;
};

type UseWithChartWidgetDrilldownResult = {
  propsWithDrilldown: ChartWidgetProps;
  isDrilldownEnabled: boolean;
  breadcrumbs: JSX.Element;
};

export const useWithChartWidgetDrilldown = ({
  propsToExtend,
  onDrilldownSelectionsChange,
}: UseWithChartWidgetDrilldownParams): UseWithChartWidgetDrilldownResult => {
  const { chartType, dataOptions, dataSource, drilldownOptions } = propsToExtend;
  const { drilldownSelections: initialDrilldownSelections } = drilldownOptions || {};
  const { openMenu } = useMenu();

  const isDrilldownApplicable = useMemo(
    () => isDrilldownApplicableToChart(chartType, dataOptions),
    [chartType, dataOptions],
  );
  const initialDrilldownPaths = useMemo(
    () => drilldownOptions?.drilldownPaths || [],
    [drilldownOptions?.drilldownPaths],
  );
  const initialDimension = useMemo(() => {
    const dummyAttribute = createAttribute({ name: 'dummy drilldown initial attribute' });
    return getDrilldownInitialDimension(chartType, dataOptions) || dummyAttribute;
  }, [chartType, dataOptions]);

  // Includes the available drilldown paths (hierarchies) from Sisense instance
  const drilldownPaths = useSyncedDrilldownPaths({
    attribute: initialDimension,
    dataSource: dataSource,
    drilldownPaths: initialDrilldownPaths,
    enabled: isDrilldownApplicable,
  });

  // Store drilldown paths in a ref to avoid triggering rerenders when they update
  const drilldownPathsRef = useRef(drilldownPaths);
  useEffect(() => {
    drilldownPathsRef.current = drilldownPaths;
  }, [drilldownPaths]);

  const isDrilldownEnabled = useMemo(() => {
    const hasDrilldownConfig =
      !!drilldownOptions?.drilldownSelections?.length || !!drilldownPaths?.length;

    return hasDrilldownConfig && isDrilldownApplicable;
  }, [drilldownOptions, isDrilldownApplicable, drilldownPaths]);

  const { drilldownDimension, drilldownFilters, breadcrumbs, openDrilldownMenu } = useDrilldown({
    initialDimension,
    initialDrilldownSelections,
    openMenu,
    onDrilldownSelectionsChange,
  });

  const drilldownOnDataPointsSelected = useCallback(
    (points: (DataPoint | ScatterDataPoint)[], event: MouseEvent) => {
      const drilldownSelectionPoints = prepareDrilldownSelectionPoints(points, event, dataOptions);
      const selectedAttributes = getSelectedDrilldownAttributes(
        initialDimension,
        initialDrilldownSelections || [],
      );
      const availableDrilldownPaths = getAvailableDrilldownPaths(
        drilldownPathsRef.current,
        selectedAttributes,
      );

      openDrilldownMenu(
        {
          left: event.clientX,
          top: event.clientY,
        },
        drilldownSelectionPoints,
        availableDrilldownPaths,
      );
    },
    [dataOptions, initialDimension, initialDrilldownSelections, openDrilldownMenu],
  );

  const drilldownOnDataPointContextMenu = useCallback(
    (point: DataPoint, event: MouseEvent) => {
      const drilldownSelectionPoints = prepareDrilldownSelectionPoints([point], event, dataOptions);
      const selectedAttributes = getSelectedDrilldownAttributes(
        initialDimension,
        initialDrilldownSelections || [],
      );
      const availableDrilldownPaths = getAvailableDrilldownPaths(
        drilldownPathsRef.current,
        selectedAttributes,
      );

      openDrilldownMenu(
        {
          left: event.clientX,
          top: event.clientY,
        },
        drilldownSelectionPoints,
        availableDrilldownPaths,
      );
    },
    [dataOptions, initialDimension, initialDrilldownSelections, openDrilldownMenu],
  );

  /**
   * Connecting drilldown to props:
   */
  const dataOptionsWithDrilldown = useMemo(() => {
    return applyDrilldownDimension(chartType, dataOptions, drilldownDimension);
  }, [chartType, dataOptions, drilldownDimension]);

  const filtersWithDrilldown = useMemo(() => {
    return drilldownFilters.length
      ? mergeFiltersOrFilterRelations(propsToExtend.filters || [], drilldownFilters)
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
    ...{
      dataOptions: dataOptionsWithDrilldown,
      filters: filtersWithDrilldown,
      onDataPointsSelected: onDataPointsSelectedWithDrilldown,
      onDataPointContextMenu: onDataPointContextMenuWithDrilldown,
    },
  } as ChartWidgetProps;

  return {
    propsWithDrilldown,
    isDrilldownEnabled,
    breadcrumbs,
  };
};
