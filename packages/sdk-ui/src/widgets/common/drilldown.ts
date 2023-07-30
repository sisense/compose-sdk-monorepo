/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useMemo, useState } from 'react';

import {
  ChartDataOptions,
  DataPoint,
  StyledColumn,
  DrilldownOptions,
  DrilldownSelection,
} from '../../types';
import { Attribute, MembersFilter, filters as filterFactory } from '@sisense/sdk-data';

export const useDrilldown = (
  dataOptions: ChartDataOptions,
  drilldownOptions?: DrilldownOptions,
) => {
  const { drilldownCategories = [], drilldownSelections: initialSelections = [] } =
    drilldownOptions ?? {};

  const [drilldownSelections, setDrilldownSelections] = useState(initialSelections);

  const availableDrilldowns = useMemo(
    () =>
      drilldownCategories.filter(({ expression }) =>
        drilldownSelections.every(({ nextCategory }) => nextCategory.expression !== expression),
      ),
    [drilldownCategories, drilldownSelections],
  );

  const selectDrilldown = useCallback(
    (points: DataPoint[], nextCategory: Attribute) => {
      setDrilldownSelections((state) => [...state, { points, nextCategory }]);
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
    () => processDrilldownSelections(dataOptions, drilldownSelections),
    [dataOptions, drilldownSelections],
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

const processDrilldownSelections = (
  dataOptions: ChartDataOptions,
  drilldownSelections: DrilldownSelection[],
) => {
  if (!('category' in dataOptions) || !dataOptions.category.length) {
    return {
      drilldownFilters: [],
      drilldownFiltersDisplayValues: [],
      drilldownCategory: undefined,
      dataOptionsWithDrilldown: dataOptions,
    };
  }

  const [firstCategory, ...otherCategories] = dataOptions.category;
  let currentCategory = ((firstCategory as StyledColumn).column ?? firstCategory) as Attribute;
  const drilldownFilters: MembersFilter[] = [];
  const drilldownFiltersDisplayValues: string[][] = [];

  drilldownSelections.forEach(({ points, nextCategory }) => {
    drilldownFilters.push(
      filterFactory.members(
        currentCategory,
        points.map((point) => `${point.categoryValue}`),
      ) as MembersFilter,
    );
    drilldownFiltersDisplayValues.push(
      points.map((point) => `${point.categoryDisplayValue ?? point.categoryValue}`),
    );
    currentCategory = nextCategory;
  });

  return {
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownCategory: currentCategory,
    dataOptionsWithDrilldown: {
      ...dataOptions,
      category: [currentCategory, ...otherCategories],
    },
  };
};
