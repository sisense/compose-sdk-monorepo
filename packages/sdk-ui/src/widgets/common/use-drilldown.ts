/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useEffect, useMemo, useState } from 'react';
import uniq from 'lodash-es/uniq';
import last from 'lodash-es/last';
import isEqual from 'lodash-es/isEqual';
import partition from 'lodash-es/partition';
import { type TFunction } from '@sisense/sdk-common';
import { Attribute, Column, MembersFilter, filterFactory, MetadataTypes } from '@sisense/sdk-data';
import { useTranslation } from 'react-i18next';
import {
  StyledColumn,
  DrilldownSelection,
  DataPoint,
  ChartDataPoint,
  MenuItemSection,
} from '../../types.js';
import { useHasChanged } from '@/common/hooks/use-has-changed.js';
import { SELECTION_TITLE_MAXIMUM_ITEMS } from '@/common-filters/selection-utils.js';
import { MenuIds } from '@/common/components/menu/menu-ids.js';
import { isSameAttribute } from '@/utils/filters.js';
import { translateColumnToAttribure } from '@/chart-data-options/utils.js';
import { Hierarchy } from '@/models';

import './drilldown.scss';
import { usePrevious } from '@/common/hooks/use-previous.js';

type UseDrilldownParams = {
  drilldownPaths: (Attribute | Hierarchy)[];
  initialDimension: Column | StyledColumn;
  drilldownSelections?: DrilldownSelection[];
  onDrilldownSelectionsChange?: (selections: DrilldownSelection[]) => void;
};

export const useDrilldown = (params: UseDrilldownParams) => {
  const {
    drilldownPaths,
    initialDimension,
    drilldownSelections: initialDrilldownSelections = [],
    onDrilldownSelectionsChange,
  } = params;
  const { t: translate } = useTranslation();

  if (!initialDimension) {
    throw new Error(
      'Initial dimension has to be specified to use drilldown with custom components',
    );
  }

  const [drilldownSelections, setDrilldownSelections] = useState<DrilldownSelection[]>(
    initialDrilldownSelections,
  );
  const isInitialSelectionsChanged = useHasChanged(params, ['drilldownSelections']);
  const prevDrilldownSelections = usePrevious(drilldownSelections);
  const isDrilldownSelectionsChanged =
    !!prevDrilldownSelections && !isEqual(prevDrilldownSelections, drilldownSelections);

  useEffect(() => {
    // Apply new selections only if they have changed to prevent losing the selection due to rerendering.
    if (isInitialSelectionsChanged) {
      setDrilldownSelections((existingDrilldownSelections) => {
        if (existingDrilldownSelections === initialDrilldownSelections) {
          return existingDrilldownSelections;
        }
        return initialDrilldownSelections;
      });
    }
  }, [initialDrilldownSelections, isInitialSelectionsChanged]);

  useEffect(() => {
    // Executes handler only when drilldown selections was changed after the initialization
    if (isDrilldownSelectionsChanged) {
      onDrilldownSelectionsChange?.(drilldownSelections);
    }
  }, [onDrilldownSelectionsChange, drilldownSelections, isDrilldownSelectionsChanged]);

  const selectedAttributes = useMemo(
    () => [
      translateColumnToAttribure(initialDimension),
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
      setDrilldownSelections((currentSelections) => {
        if (!hierarchy) {
          return [...currentSelections, { points, nextDimension }];
        }

        const isFirstLevelSelected = isSameAttribute(hierarchy.levels[0], nextDimension);
        // clears all selections, as the first hierarchy level always matches the initial dimensions
        if (isFirstLevelSelected) {
          return [];
        }

        const matchingSelectionIndex = currentSelections.findIndex((currentSelection) =>
          isSameAttribute(currentSelection.nextDimension, nextDimension),
        );
        const isLevelAlreadySelected = matchingSelectionIndex !== -1;

        // trims selections to include only hierarchy levels up to the current one
        if (isLevelAlreadySelected) {
          return currentSelections.slice(0, matchingSelectionIndex + 1);
        }

        const lastSelectedLevel = last(currentSelections)?.nextDimension;
        const lastSelectedLevelIndex = currentSelections.length
          ? hierarchy.levels.findIndex(
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
      });
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
    () => processDrilldownSelections(drilldownSelections, initialDimension, translate),
    [drilldownSelections, initialDimension, translate],
  );

  return {
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
    drilldownSelections,
    availableDrilldownPaths,
    ...drilldownProps,
  };
};

/**
 * @internal
 */
export const processDrilldownSelections = (
  drilldownSelections: DrilldownSelection[],
  initialDimension: Column | StyledColumn,
  translate: TFunction,
) => {
  let currentDimension = initialDimension && translateColumnToAttribure(initialDimension);
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

export function getSelectionTitleMenuItem(
  points: DataPoint[],
  drilldownDimension: Attribute,
): MenuItemSection {
  const selectionNames = uniq(
    points.map(getDisplayMemberNameFromDataPoint).filter((name) => !!name),
  );

  if (selectionNames.length > SELECTION_TITLE_MAXIMUM_ITEMS) {
    return {
      sectionTitle: drilldownDimension.name,
    };
  }

  return {
    id: MenuIds.DRILLDOWN_CHART_POINTS_SELECTION,
    sectionTitle: selectionNames.join(', '),
  };
}

function getHierarchyLevelMenuItemOffset(index: number) {
  const MENU_ITEM_DEFAUT_PADDING_LEFT = 30;
  const NESTED_MENU_ITEM_OFFSET_LEFT = 12;

  return MENU_ITEM_DEFAUT_PADDING_LEFT + NESTED_MENU_ITEM_OFFSET_LEFT * index;
}

export function getDrilldownMenuItems(
  availableDrilldownPaths: (Attribute | Hierarchy)[],
  drilldownDimension: Attribute,
  selectFn: (nextDimension: Attribute, hierarchy?: Hierarchy) => void,
  translate: TFunction,
): MenuItemSection {
  const [availableDrilldownDimensions, availableDrilldownHierarchies] = partition<
    Attribute | Hierarchy,
    Attribute
  >(availableDrilldownPaths, MetadataTypes.isAttribute.bind(MetadataTypes));
  const drilldownDimensionsMenuItems = availableDrilldownDimensions.map((nextDimension) => ({
    caption: nextDimension.name,
    onClick: () => selectFn(nextDimension),
  }));
  const drilldownHierarchiesMenuItems = availableDrilldownHierarchies.map((hierarchy) => {
    return {
      caption: hierarchy.title,
      subItems: [
        {
          items: hierarchy.levels.map((level, index) => ({
            caption: level.name,
            class: index === 0 ? '' : 'csdk-drilldown-hierarchy-nested-menu-item',
            style: {
              paddingLeft: `${getHierarchyLevelMenuItemOffset(index)}px`,
            },
            disabled: isSameAttribute(level, drilldownDimension),
            onClick: () => selectFn(level, hierarchy),
          })),
        },
      ],
    };
  });

  return {
    id: MenuIds.DRILLDOWN_DRILL_DIRECTIONS,
    sectionTitle: translate('drilldown.drillMenuItem'),
    items: [...drilldownHierarchiesMenuItems, ...drilldownDimensionsMenuItems],
  };
}
