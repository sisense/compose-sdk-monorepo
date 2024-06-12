import { isFiltersChanged, isRelationsChanged } from '@/utils/filters-comparator';
import { getFilterListAndRelations } from '@sisense/sdk-data';
import { ExecuteQueryParams } from '../index.js';
import { useHasChanged } from '../common/hooks/use-has-changed';

/** List of parameters that can be compared by deep comparison */
const simplySerializableParamNames: (keyof ExecuteQueryParams)[] = [
  'dataSource',
  'dimensions',
  'measures',
  'count',
  'offset',
  'onBeforeQuery',
];

export function useQueryParamsChanged(params: ExecuteQueryParams) {
  return useHasChanged(params, simplySerializableParamNames, (params, prev) => {
    const { filters: prevFilterList, relations: prevRelationsList } = getFilterListAndRelations(
      prev.filters,
    );
    const { filters: newFilterList, relations: newRelationsList } = getFilterListAndRelations(
      params.filters,
    );

    // TODO: check if relations are changed
    // Function has to compare logical structure of relations, not just references
    return (
      isFiltersChanged(prevFilterList, newFilterList) ||
      isRelationsChanged(prevFilterList, newFilterList, prevRelationsList, newRelationsList) ||
      isFiltersChanged(prev.highlights, params.highlights)
    );
  });
}
