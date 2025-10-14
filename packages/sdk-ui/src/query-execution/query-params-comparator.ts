import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';

import { isFiltersChanged, isRelationsChanged } from '@/utils/filters-comparator';
import { areMeasuresChanged } from '@/utils/measures-comparator.js';

import { useHasChanged } from '../common/hooks/use-has-changed';
import { ExecuteQueryParams } from './types.js';

/** List of parameters that can be compared by deep comparison */
const simplySerializableParamNames: (keyof ExecuteQueryParams)[] = [
  'dataSource',
  'dimensions',
  'count',
  'offset',
  'onBeforeQuery',
];

export function useQueryParamsChanged(params: ExecuteQueryParams) {
  return useHasChanged(params, simplySerializableParamNames, (params, prev) => {
    const { filters: prevFilterList, relations: prevRelationsList } = getFilterListAndRelationsJaql(
      prev.filters,
    );
    const { filters: newFilterList, relations: newRelationsList } = getFilterListAndRelationsJaql(
      params.filters,
    );

    // TODO: check if relations are changed
    // Function has to compare logical structure of relations, not just references
    return (
      areMeasuresChanged(prev.measures, params.measures) ||
      isFiltersChanged(prevFilterList, newFilterList) ||
      isRelationsChanged(prevFilterList, newFilterList, prevRelationsList, newRelationsList) ||
      isFiltersChanged(prev.highlights, params.highlights)
    );
  });
}
