/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines-per-function */
import { useCallback, useMemo, useState } from 'react';

import { DataPoint, StyledColumn, DrilldownSelection } from '../../types.js';
import { Attribute, Column, MembersFilter, filterFactory } from '@sisense/sdk-data';

export const useCustomDrilldown = ({
  drilldownDimensions,
  initialDimension,
}: {
  drilldownDimensions: Attribute[];
  initialDimension: Column | StyledColumn;
}) => {
  if (!initialDimension) {
    throw new Error(
      'Initial dimension has to be specified to use drilldown with custom components',
    );
  }

  const [drilldownSelections, setDrilldownSelections] = useState([] as DrilldownSelection[]);

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
        points.map((point) => `${point.categoryValue}`),
      ) as MembersFilter,
    );
    drilldownFiltersDisplayValues.push(
      points.map((point) => `${point.categoryDisplayValue ?? point.categoryValue}`),
    );
    currentDimension = nextDimension;
  });

  return {
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension: currentDimension,
  };
};
