import { Filter, FilterJaql, IncludeMembersFilter, IncludeAllFilter } from '@sisense/sdk-data';
import { Panel, PanelItem } from './types';

/**
 * Extracts filter model components from a FilterJaql object.
 *
 * @param {FilterJaql} jaql - The FilterJaql object.
 * @returns {object} - An object containing the extracted filter model components, including filter, backgroundFilter, and turnOffMembersFilter.
 */
export function extractFilterModelFromJaql(jaql: FilterJaql) {
  const { filter: nestedFilter, ...filter } = jaql.filter;
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
    (filter as IncludeMembersFilter).members &&
    (filter as IncludeMembersFilter).members.length === 0
  ) {
    (filter as IncludeAllFilter).all = true;
  }

  return {
    filter,
    backgroundFilter,
    turnOffMembersFilter,
  };
}

/**
 * Creates a Filter from a FilterJaql object.
 *
 * @param jaql - The filter JAQL object.
 * @returns - The created Filter object.
 * @internal
 */
export function createFilterFromJaql(jaql: FilterJaql, instanceid?: string): Filter {
  // TODO: rewrite to transform into valid dimensional element filter object
  return {
    guid: instanceid,
    jaql: (nested?: boolean) => {
      if (nested) {
        return jaql;
      }
      return {
        jaql,
        panel: 'scope',
      };
    },
    attribute: {
      id: jaql.dim,
    },
    type: 'filter',

    serializable() {
      return { ...this, jaql: this.jaql() };
    },
    toJSON() {
      return this.serializable();
    },
  } as Filter;
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
 * @param {Panel[]} panels - The array of panels.
 * @returns {Filter[]} - The extracted filters.
 */
export function extractFilters(panels: Panel[]) {
  return getEnabledFilterPanelItems(panels).map((filterItem) =>
    createFilterFromJaql(filterItem.jaql as FilterJaql, filterItem.instanceid),
  );
}
