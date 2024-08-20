/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useEffect, useMemo, useState } from 'react';

import { StyledColumn, DrilldownSelection, DataPoint, ChartDataPoint } from '../../types.js';
import { Attribute, Column, MembersFilter, filterFactory } from '@sisense/sdk-data';
import { useHasChanged } from '@/common/hooks/use-has-changed.js';

type UseDrilldownParams = {
  drilldownDimensions: Attribute[];
  initialDimension: Column | StyledColumn;
  drilldownSelections?: DrilldownSelection[];
};

export const useDrilldown = (params: UseDrilldownParams) => {
  const {
    drilldownDimensions,
    initialDimension,
    drilldownSelections: initialDrilldownSelections = [],
  } = params;

  if (!initialDimension) {
    throw new Error(
      'Initial dimension has to be specified to use drilldown with custom components',
    );
  }

  const [drilldownSelections, setDrilldownSelections] = useState<DrilldownSelection[]>(
    initialDrilldownSelections,
  );
  const isInitialSelectionsChanged = useHasChanged(params, ['drilldownSelections']);

  useEffect(() => {
    // Apply new selections only if they have changed to prevent losing the selection due to rerendering.
    if (isInitialSelectionsChanged) {
      setDrilldownSelections(initialDrilldownSelections);
    }
  }, [initialDrilldownSelections, setDrilldownSelections, isInitialSelectionsChanged]);

  const availableDrilldowns = useMemo(
    () =>
      drilldownDimensions.filter(({ expression }) =>
        drilldownSelections.every(({ nextDimension }) => nextDimension.expression !== expression),
      ),
    [drilldownDimensions, drilldownSelections],
  );

  const selectDrilldown = useCallback(
    (points: DataPoint[], nextDimension: Attribute) => {
      setDrilldownSelections((state) => [...state, { points, nextDimension }]);
    },
    [setDrilldownSelections],
  );

  const sliceDrilldownSelections = useCallback(
    (i: number) => {
      setDrilldownSelections((state) => state.slice(0, i));
    },
    [setDrilldownSelections],
  );

  const clearDrilldownSelections = useCallback(() => {
    setDrilldownSelections([]);
  }, [setDrilldownSelections]);

  const drilldownProps = useMemo(
    () => processDrilldownSelections(drilldownSelections, initialDimension),
    [drilldownSelections, initialDimension],
  );

  return {
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
    drilldownSelections,
    availableDrilldowns,
    ...drilldownProps,
  };
};

/**
 * @internal
 */
export const processDrilldownSelections = (
  drilldownSelections: DrilldownSelection[],
  initialDimension: Column | StyledColumn | null,
) => {
  let currentDimension = ((initialDimension as StyledColumn).column ??
    initialDimension) as Attribute;
  const drilldownFilters: MembersFilter[] = [];
  const drilldownFiltersDisplayValues: string[][] = [];

  drilldownSelections.forEach(({ points, nextDimension }) => {
    drilldownFilters.push(
      filterFactory.members(
        currentDimension,
        points.map(getMemberNameFromDataPoint),
      ) as MembersFilter,
    );
    drilldownFiltersDisplayValues.push(points.map(getDisplayMemberNameFromDataPoint));
    currentDimension = nextDimension;
  });

  return {
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension: currentDimension,
  };
};

function getDisplayMemberNameFromDataPoint(point: ChartDataPoint) {
  // only DataPoint is currently supported for drilldown
  if ('categoryDisplayValue' in point) {
    return `${point.categoryDisplayValue}`;
  } else if ('categoryValue' in point) {
    return `${point.categoryValue}`;
  } else {
    return '';
  }
}

export function getMemberNameFromDataPoint(point: ChartDataPoint) {
  // only DataPoint is currently supported for drilldown
  if ('categoryValue' in point) {
    return `${point.categoryValue}`;
  } else {
    return '';
  }
}
