import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Attribute, Column, createAttribute } from '@sisense/sdk-data';
import isEqual from 'lodash-es/isEqual';

import { StyledColumn } from '@/domains/visualizations/core/chart-data-options/types.js';
import { translateColumnToAttribute } from '@/domains/visualizations/core/chart-data-options/utils.js';
import { useMenu } from '@/infra/contexts/menu-provider/hooks/use-menu.js';
import { combineHandlers } from '@/shared/utils/combine-handlers.js';
import { getDataOptionByLocation } from '@/shared/utils/data-option-location';
import { mergeFiltersOrFilterRelations } from '@/shared/utils/filter-relations.js';
import { DataOptionLocation, DrilldownSelection, PivotTableDataPoint } from '@/types.js';

import {
  getAvailableDrilldownPaths,
  getSelectedDrilldownAttributes,
} from '../../../drilldown/drilldown-utils.js';
import { useDrilldown } from '../../../drilldown/hooks/use-drilldown.js';
import { useSyncedDrilldownPathsManager } from '../../../drilldown/hooks/use-synced-drilldown-paths-manager.js';
import { PivotTableWidgetProps } from './types';
import {
  applyDrilldownDimensionToPivot,
  getInitialDimensionLocation,
  isDrilldownApplicableToPivot,
} from './utils.js';

type UseWithPivotTableWidgetDrilldownParams = {
  propsToExtend: PivotTableWidgetProps;
  onDrilldownSelectionsChange?: (
    target: Attribute | DataOptionLocation,
    selections: DrilldownSelection[],
  ) => void;
};

type UseWithPivotTableWidgetDrilldownResult = {
  propsWithDrilldown: PivotTableWidgetProps;
  isDrilldownEnabled: boolean;
  breadcrumbs: JSX.Element;
};

const DUMMY_DRILLDOWN_INITIAL_ATTRIBUTE = createAttribute({
  name: 'dummy drilldown initial attribute',
});

export function useWithPivotTableWidgetDrilldown(
  params: UseWithPivotTableWidgetDrilldownParams,
): UseWithPivotTableWidgetDrilldownResult {
  const { propsToExtend, onDrilldownSelectionsChange } = params;
  const { dataSource, drilldownOptions } = propsToExtend;
  const {
    drilldownSelections: initialDrilldownSelections,
    drilldownTarget: initialDrilldownTarget,
  } = drilldownOptions || {};
  const { openMenu } = useMenu();
  const [initialDimensionLocation, setInitialDimensionLocation] = useState<
    DataOptionLocation | undefined
  >(
    initialDrilldownTarget &&
      initialDrilldownSelections &&
      getInitialDimensionLocation(
        propsToExtend.dataOptions,
        initialDrilldownTarget,
        initialDrilldownSelections,
      ),
  );
  // Use ref to avoid re-rendering and getting actual value on the same render cycle (needed for onDrilldownSelectionsChange callback)
  const initialDimensionLocationRef = useRef<DataOptionLocation | undefined>(
    initialDimensionLocation,
  );

  useEffect(() => {
    if (initialDrilldownTarget && initialDrilldownSelections) {
      const location = getInitialDimensionLocation(
        propsToExtend.dataOptions,
        initialDrilldownTarget,
        initialDrilldownSelections,
      );
      initialDimensionLocationRef.current = location;
      setInitialDimensionLocation(location);
    }
  }, [propsToExtend.dataOptions, initialDrilldownTarget, initialDrilldownSelections]);

  const initialDimension = useMemo(() => {
    return (
      (initialDimensionLocation &&
        getDataOptionByLocation<Column | StyledColumn>(
          propsToExtend.dataOptions,
          initialDimensionLocation,
        )) ||
      DUMMY_DRILLDOWN_INITIAL_ATTRIBUTE
    );
  }, [propsToExtend.dataOptions, initialDimensionLocation]);

  const isDrilldownApplicable = useMemo(() => {
    return isDrilldownApplicableToPivot(propsToExtend.dataOptions);
  }, [propsToExtend.dataOptions]);

  const initialDrilldownPaths = useMemo(
    () => drilldownOptions?.drilldownPaths || [],
    [drilldownOptions?.drilldownPaths],
  );

  // Includes the available drilldown paths (hierarchies) from Sisense instance
  const { drilldownPaths, synchronize: synchronizeDrilldownPaths } =
    useSyncedDrilldownPathsManager();

  const isDrilldownEnabled = useMemo(() => {
    const hasDrilldownConfig =
      !!drilldownOptions?.drilldownSelections?.length || !!drilldownPaths?.length;

    return hasDrilldownConfig && isDrilldownApplicable;
  }, [drilldownOptions, isDrilldownApplicable, drilldownPaths]);

  const {
    drilldownDimension,
    drilldownFilters,
    breadcrumbs,
    drilldownSelections,
    openDrilldownMenu,
  } = useDrilldown({
    initialDimension: initialDimension,
    initialDrilldownSelections: initialDrilldownSelections,
    openMenu,
    onDrilldownSelectionsChange: useCallback(
      (selections: DrilldownSelection[]) => {
        if (initialDimensionLocationRef.current) {
          onDrilldownSelectionsChange?.(initialDimensionLocationRef.current, selections);
        }
      },
      [onDrilldownSelectionsChange],
    ),
  });

  /**
   * Connecting drilldown to props:
   */
  const dataOptionsWithDrilldown = useMemo(() => {
    return initialDimensionLocation
      ? applyDrilldownDimensionToPivot(
          propsToExtend.dataOptions,
          initialDimensionLocation,
          drilldownDimension,
        )
      : propsToExtend.dataOptions;
  }, [initialDimensionLocation, propsToExtend.dataOptions, drilldownDimension]);

  const drilldownOnDataPointContextMenu = useCallback(
    async (point: PivotTableDataPoint, event: MouseEvent) => {
      const targetEntry =
        point.entries.rows?.[point.entries.rows?.length - 1] ??
        point.entries.columns?.[point.entries.columns?.length - 1];

      // Skip if the data point is not a data cell or it represents values or it has no selectable target entry
      if (
        !point.isDataCell ||
        point.entries.values?.length ||
        !targetEntry ||
        !targetEntry.dataOptionLocation
      ) {
        return;
      }

      const targetDataOptionLocation = targetEntry.dataOptionLocation;

      // Skip if the target data option is not the same as the initial dimension location
      if (
        initialDimensionLocationRef.current &&
        !isEqual(initialDimensionLocationRef.current, targetDataOptionLocation)
      ) {
        return;
      }

      // Get original data option by the target data option location
      const targetDataOption = getDataOptionByLocation<Column | StyledColumn>(
        propsToExtend.dataOptions,
        targetDataOptionLocation,
      ) as Column | StyledColumn;

      const synchronizedPaths = await synchronizeDrilldownPaths({
        attribute: translateColumnToAttribute(targetDataOption),
        dataSource: dataSource,
        drilldownPaths: initialDrilldownPaths,
      });

      const drilldownSelectionPoints = [
        {
          categoryValue: targetEntry.value,
          categoryDisplayValue: targetEntry.displayValue,
        },
      ];

      const selectedAttributes = getSelectedDrilldownAttributes(
        targetDataOption,
        drilldownSelections || [],
      );
      const availableDrilldownPaths = getAvailableDrilldownPaths(
        synchronizedPaths,
        selectedAttributes,
      );

      openDrilldownMenu(
        {
          left: event.clientX,
          top: event.clientY,
        },
        drilldownSelectionPoints,
        availableDrilldownPaths,
        () => {
          initialDimensionLocationRef.current = targetDataOptionLocation;
          setInitialDimensionLocation(targetDataOptionLocation);
        },
      );
    },
    [
      drilldownSelections,
      dataSource,
      initialDrilldownPaths,
      propsToExtend.dataOptions,
      synchronizeDrilldownPaths,
      openDrilldownMenu,
    ],
  );

  const filtersWithDrilldown = useMemo(() => {
    return drilldownFilters.length
      ? mergeFiltersOrFilterRelations(propsToExtend.filters || [], drilldownFilters)
      : propsToExtend.filters;
  }, [propsToExtend.filters, drilldownFilters]);

  const onDataPointContextMenuWithDrilldown = useMemo(
    () => combineHandlers([drilldownOnDataPointContextMenu, propsToExtend.onDataPointContextMenu]),
    [drilldownOnDataPointContextMenu, propsToExtend.onDataPointContextMenu],
  );

  const propsWithDrilldown = {
    ...propsToExtend,
    ...{
      dataOptions: dataOptionsWithDrilldown,
      filters: filtersWithDrilldown,
      onDataPointContextMenu: onDataPointContextMenuWithDrilldown,
    },
  } as PivotTableWidgetProps;

  return {
    propsWithDrilldown,
    isDrilldownEnabled,
    breadcrumbs,
  };
}
