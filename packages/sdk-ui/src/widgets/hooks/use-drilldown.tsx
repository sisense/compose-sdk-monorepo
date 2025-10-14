/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type TFunction } from '@sisense/sdk-common';
import { Attribute, Column, MetadataTypes } from '@sisense/sdk-data';
import partition from 'lodash-es/partition';
import uniq from 'lodash-es/uniq';

import { SELECTION_TITLE_MAXIMUM_ITEMS } from '@/common-filters/selection-utils.js';
import { MenuIds, MenuSectionIds } from '@/common/components/menu/menu-ids.js';
import { OpenMenuFn } from '@/common/components/menu/types.js';
import { Hierarchy } from '@/models';
import { isSameAttribute } from '@/utils/filters.js';

import {
  DataPoint,
  DrilldownSelection,
  MenuItemSection,
  MenuPosition,
  StyledColumn,
} from '../../types.js';
import { DrilldownBreadcrumbs } from '../common/drilldown-breadcrumbs/drilldown-breadcrumbs.js';
import '../common/drilldown.scss';
import {
  getDisplayMemberNameFromDataPoint,
  useDrilldownCore,
} from '../common/use-drilldown-core.js';

type UseDrilldownParams = {
  initialDimension: Column | StyledColumn;
  drilldownPaths?: (Attribute | Hierarchy)[];
  drilldownSelections?: DrilldownSelection[];
  /**
   * todo: make it optional when we will have a public `MenuProvider`.
   * Without provided function, it should open internal menu with the help of `useMenu` hook
   */
  openMenu: OpenMenuFn;
  onDrilldownSelectionsChange?: (selections: DrilldownSelection[]) => void;
};

export const useDrilldown = ({
  initialDimension,
  drilldownPaths,
  drilldownSelections,
  openMenu,
  onDrilldownSelectionsChange,
}: UseDrilldownParams) => {
  const { t: translate } = useTranslation();

  const {
    availableDrilldownPaths,
    drilldownFilters,
    drilldownFiltersDisplayValues,
    drilldownDimension,
    selectDrilldown,
    sliceDrilldownSelections,
    clearDrilldownSelections,
  } = useDrilldownCore({
    initialDimension,
    drilldownPaths,
    drilldownSelections,
    onDrilldownSelectionsChange,
  });

  const openDrilldownMenu = useCallback(
    (position: MenuPosition, points: DataPoint[]) => {
      const menuItems = [
        getSelectionTitleMenuItem(points, drilldownDimension),
        getDrilldownMenuItems(
          availableDrilldownPaths,
          drilldownDimension,
          (nextDimension: Attribute, hierarchy?: Hierarchy) => {
            selectDrilldown(points, nextDimension, hierarchy);
          },
          translate,
        ),
      ];

      openMenu({ id: MenuIds.WIDGET_POINTS_DRILLDOWN, position, itemSections: menuItems });
    },
    [drilldownDimension, availableDrilldownPaths, translate, selectDrilldown, openMenu],
  );

  const breadcrumbs = useMemo(() => {
    return (
      drilldownDimension && (
        <DrilldownBreadcrumbs
          filtersDisplayValues={drilldownFiltersDisplayValues}
          currentDimension={drilldownDimension}
          clearDrilldownSelections={clearDrilldownSelections}
          sliceDrilldownSelections={sliceDrilldownSelections}
        />
      )
    );
  }, [
    clearDrilldownSelections,
    drilldownDimension,
    drilldownFiltersDisplayValues,
    sliceDrilldownSelections,
  ]);

  return {
    drilldownDimension,
    drilldownFilters,
    breadcrumbs,
    openDrilldownMenu,
  };
};

/** @internal */
export function getSelectionTitleMenuItem(
  points: DataPoint[],
  drilldownDimension: Attribute,
): MenuItemSection {
  const selectionNames = uniq(
    points.map(getDisplayMemberNameFromDataPoint).filter((name) => !!name),
  );

  if (selectionNames.length > SELECTION_TITLE_MAXIMUM_ITEMS) {
    return {
      id: MenuSectionIds.DRILLDOWN_CHART_POINTS_SELECTION,
      sectionTitle: drilldownDimension.name,
    };
  }

  return {
    id: MenuSectionIds.DRILLDOWN_CHART_POINTS_SELECTION,
    sectionTitle: selectionNames.join(', '),
  };
}

function getHierarchyLevelMenuItemOffset(index: number) {
  const MENU_ITEM_DEFAUT_PADDING_LEFT = 30;
  const NESTED_MENU_ITEM_OFFSET_LEFT = 12;

  return MENU_ITEM_DEFAUT_PADDING_LEFT + NESTED_MENU_ITEM_OFFSET_LEFT * index;
}

/** @internal */
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
    id: MenuSectionIds.DRILLDOWN_DRILL_DIRECTIONS,
    sectionTitle: translate('drilldown.drillMenuItem'),
    items: [...drilldownHierarchiesMenuItems, ...drilldownDimensionsMenuItems],
  };
}
