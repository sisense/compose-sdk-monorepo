import { Filter } from '@sisense/sdk-data';
import { FilterJaql, Panel } from './types';
import { getEnabledPanelItems } from './utils';

/**
 * Extracts filter model components from a FilterJaql object.
 *
 * @param {FilterJaql} jaql - The FilterJaql object.
 * @returns {object} - An object containing the extracted filter model components, including filter, backgroundFilter, and turnOffMembersFilter.
 */
function extractFilterFromJaql(jaql: FilterJaql) {
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

  return {
    filter,
    backgroundFilter,
    turnOffMembersFilter,
  };
}

/**
 * Transforms filter jaql with background filter to a valid nested filter structure.
 *
 * @param jaql - The filter JAQL object.
 * @returns - The transformed filter JAQL object.
 */
function transformBackgroundFilter(jaql: FilterJaql) {
  const { filter, backgroundFilter } = extractFilterFromJaql(jaql);

  if (backgroundFilter) {
    const isIncludeAllFilter = 'all' in filter && filter.all;
    const isExcludeFilter = 'exclude' in filter;
    const isExcludeBackgroundFilter = 'exclude' in backgroundFilter;

    if (isExcludeFilter && isExcludeBackgroundFilter) {
      return {
        ...jaql,
        filter: {
          exclude: {
            members: [...backgroundFilter.exclude.members, ...filter.exclude.members],
          },
        },
      };
    }

    return {
      ...jaql,
      filter: { ...backgroundFilter, ...(!isIncludeAllFilter && { filter: filter }) },
    };
  }

  return jaql;
}

/**
 * Creates a Filter from a FilterJaql object.
 *
 * @param jaql - The filter JAQL object.
 * @returns - The created Filter object.
 */
// TODO: rewrite to transform into valid dimensional element filter object
export function createFilterFromJaql(jaql: FilterJaql): Filter {
  const filterJaql = transformBackgroundFilter(jaql);
  return {
    jaql: (nested?: boolean) => {
      if (nested) {
        return filterJaql;
      }
      return {
        jaql: filterJaql,
        panel: 'scope',
      };
    },
    type: 'filter',
  } as Filter;
}

/**
 * Extracts filters from the widget panel.
 *
 * @param {Panel[]} panels - The array of panels.
 * @returns {Filter[]} - The extracted filters.
 */
export function extractFilters(panels: Panel[]) {
  const filterPanel = getEnabledPanelItems(panels, 'filters');
  return filterPanel.map((f) => createFilterFromJaql(f.jaql as FilterJaql));
}
