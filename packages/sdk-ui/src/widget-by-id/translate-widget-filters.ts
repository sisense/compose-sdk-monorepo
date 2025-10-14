import {
  createFilterFromJaql,
  FilterJaql,
  IncludeAllFilterJaql,
  IncludeMembersFilterJaql,
} from '@sisense/sdk-data';

import { Panel, PanelItem } from './types.js';

/**
 * Extracts filter model components from a FilterJaql object.
 *
 * @param jaql - The FilterJaql object.
 * @returns An object containing the extracted filter model components, including filter, backgroundFilter, and turnOffMembersFilter.
 */
export function extractFilterModelFromJaql(jaql: FilterJaql) {
  const { filter: nestedFilter, ...baseFilter } = jaql.filter;
  const isNestedTurnOffMembersFilter =
    nestedFilter && 'turnedOff' in nestedFilter && nestedFilter.turnedOff;
  let backgroundFilter;
  let turnOffMembersFilter;

  if (isNestedTurnOffMembersFilter) {
    turnOffMembersFilter = nestedFilter;
  } else {
    backgroundFilter = nestedFilter;
  }

  // Transforms member filter without selected items into "include all" filter
  if (
    (baseFilter as IncludeMembersFilterJaql).members &&
    (baseFilter as IncludeMembersFilterJaql).members.length === 0
  ) {
    (baseFilter as IncludeAllFilterJaql).all = true;
  }

  return {
    filter: baseFilter,
    backgroundFilter,
    turnOffMembersFilter,
  };
}

function splitComplexFilterItem(filterItem: PanelItem): PanelItem[] {
  const { filter, backgroundFilter, turnOffMembersFilter } = extractFilterModelFromJaql(
    filterItem.jaql as FilterJaql,
  );
  const filterItems = [
    {
      ...filterItem,
      jaql: {
        ...filterItem.jaql,
        filter: {
          ...filter,
          ...(turnOffMembersFilter && {
            filter: turnOffMembersFilter,
          }),
        },
      },
    },
  ];

  if (backgroundFilter) {
    filterItems.push({
      ...filterItem,
      jaql: {
        ...filterItem.jaql,
        filter: backgroundFilter,
      },
      // "background" filters always enabled
      disabled: false,
    });
  }

  return filterItems;
}

function getEnabledFilterPanelItems(panels: Panel[]): PanelItem[] {
  const filterPanel = panels.find((p) => p.name === 'filters');
  const filterItems: PanelItem[] = [];
  filterPanel?.items.forEach((item) => {
    filterItems.push(...splitComplexFilterItem(item).filter(({ disabled }) => !disabled));
  });

  return filterItems;
}

/**
 * Extracts filters from the widget panel.
 *
 * @param panels - The array of panels.
 * @returns The extracted filters.
 */
export function extractWidgetFilters(panels: Panel[]) {
  return getEnabledFilterPanelItems(panels).map((filterItem) =>
    createFilterFromJaql(filterItem.jaql as FilterJaql, filterItem.instanceid),
  );
}
