/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useMemo } from 'react';
import last from 'lodash-es/last';
import { type TFunction } from '@sisense/sdk-common';
import { Attribute, Column, MembersFilter, filterFactory, MetadataTypes } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';
import { StyledColumn, DrilldownSelection, DataPoint, ChartDataPoint } from '../../types.js';
import { isSameAttribute } from '@/utils/filters.js';
import { translateColumnToAttribute } from '@/chart-data-options/utils.js';
import { Hierarchy } from '@/models';
import { useSyncedState } from '@/common/hooks/use-synced-state.js';

import './drilldown.scss';
import { TranslatableError } from '@/translation/translatable-error.js';

type UseDrilldownCoreParams = {
  drilldownPaths?: (Attribute | Hierarchy)[];
  initialDimension: Column | StyledColumn;
  drilldownSelections?: DrilldownSelection[];
  onDrilldownSelectionsChange?: (selections: DrilldownSelection[]) => void;
};

export const useDrilldownCore = (params: UseDrilldownCoreParams) => {
  const { initialDimension, onDrilldownSelectionsChange } = params;
  const drilldownPaths = useMemo(() => params.drilldownPaths || [], [params.drilldownPaths]);
  const initialDrilldownSelections = useMemo(
    () => params.drilldownSelections || [],
    [params.drilldownSelections],
  );
  const { t: translate } = useTranslation();

  if (!initialDimension) {
    throw new TranslatableError('errors.drilldownNoInitialDimension');
  }

  const [drilldownSelections, setDrilldownSelections] = useSyncedState<DrilldownSelection[]>(
    initialDrilldownSelections,
    { onLocalStateChange: onDrilldownSelectionsChange },
  );

  const selectedAttributes = useMemo(
    () => [
      translateColumnToAttribute(initialDimension),
      ...drilldownSelections.map(({ nextDimension }) => nextDimension),
    ],
    [initialDimension, drilldownSelections],
  );

  const availableDrilldownPaths = useMemo(() => {
    return drilldownPaths.filter((drilldownPath) => {
      const isAttribute = MetadataTypes.isAttribute(drilldownPath);

      if (isAttribute) {
        const dimension = drilldownPath;
        return selectedAttributes.every(
          (selectedAttribute) => !isSameAttribute(selectedAttribute, dimension),
        );
      }

      const hierarchy = drilldownPath;
      return selectedAttributes.every((attribute, index) =>
        isSameAttribute(attribute, hierarchy.levels[index]),
      );
    });
  }, [drilldownPaths, selectedAttributes]);

  const selectDrilldown = useCallback(
    (points: DataPoint[], nextDimension: Attribute, hierarchy?: Hierarchy) => {
      setDrilldownSelections((currentSelections) =>
        updateDrilldownSelections(currentSelections, points, nextDimension, hierarchy),
      );
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

  const { drilldownFilters, drilldownFiltersDisplayValues, drilldownDimension } = useMemo(
    () => processDrilldownSelections(drilldownSelections, initialDimension, translate),
    [drilldownSelections, initialDimension, translate],
  );

  return {
    drilldownSelections,
    availableDrilldownPaths,
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension,
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
  };
};

/**
 * Updates the drilldown selections based on the current selections, the next data points,
 * and the specified hierarchy level.
 *
 * @internal
 */
export const updateDrilldownSelections = (
  currentSelections: DrilldownSelection[],
  points: DataPoint[],
  nextDimension: Attribute,
  hierarchy?: Hierarchy,
) => {
  if (!hierarchy?.levels) {
    return [...currentSelections, { points, nextDimension }];
  }

  const isFirstLevelSelected = isSameAttribute(hierarchy.levels[0], nextDimension);
  // clears all selections, as the first hierarchy level always matches the initial dimensions
  if (isFirstLevelSelected) {
    return [];
  }

  const matchingSelectionIndex =
    currentSelections?.findIndex((currentSelection) =>
      isSameAttribute(currentSelection.nextDimension, nextDimension),
    ) ?? -1;
  const isLevelAlreadySelected = matchingSelectionIndex !== -1;

  // trims selections to include only hierarchy levels up to the current one
  if (isLevelAlreadySelected) {
    return currentSelections.slice(0, matchingSelectionIndex + 1);
  }

  const lastSelectedLevel = last(currentSelections)?.nextDimension;
  const lastSelectedLevelIndex = currentSelections.length
    ? // findIndex should be safe here, as there is an early return if the hierarchy is not defined
      hierarchy.levels.findIndex(
        (level) => lastSelectedLevel && isSameAttribute(level, lastSelectedLevel),
      )
    : 0;
  const nextLevelIndex = hierarchy.levels.indexOf(nextDimension);
  const hierarchyLevelsToApply = hierarchy.levels.slice(
    lastSelectedLevelIndex + 1,
    nextLevelIndex + 1,
  );
  const newSelections = hierarchyLevelsToApply.map((level, index) => ({
    points: index === 0 ? points : [],
    nextDimension: level,
  }));

  // extends selections with hierarchy levels down from the current one
  return [...currentSelections, ...newSelections];
};

/**
 * @internal
 */
export const processDrilldownSelections = (
  drilldownSelections: DrilldownSelection[],
  initialDimension: Column | StyledColumn,
  translate: TFunction,
) => {
  let currentDimension = initialDimension && translateColumnToAttribute(initialDimension);
  const drilldownFilters: MembersFilter[] = [];
  const drilldownFiltersDisplayValues: string[][] = [];

  drilldownSelections.forEach(({ points, nextDimension }) => {
    drilldownFilters.push(
      filterFactory.members(
        currentDimension,
        points.map(getMemberNameFromDataPoint),
      ) as MembersFilter,
    );
    const displayValue = points.length
      ? points.map(getDisplayMemberNameFromDataPoint)
      : [`${currentDimension.name} (${translate('drilldown.breadcrumbsAllSuffix')})`];
    drilldownFiltersDisplayValues.push(displayValue);
    currentDimension = nextDimension;
  });

  return {
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension: currentDimension,
  };
};

export function getDisplayMemberNameFromDataPoint(point: ChartDataPoint) {
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
