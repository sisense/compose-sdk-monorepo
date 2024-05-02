import { isFiltersChanged, isRelationsChanged } from '@/utils/filters-comparator';
import { getFilterListAndRelations } from '@sisense/sdk-data';
import isEqual from 'lodash/isEqual';
import { ExecuteQueryParams } from '../index.js';

/** List of parameters that can be compared by deep comparison */
const simplySerializableParamNames: (keyof ExecuteQueryParams)[] = [
  'dataSource',
  'dimensions',
  'measures',
  'count',
  'offset',
  'onBeforeQuery',
];

/**
 * Checks if the query parameters have changed by deep comparison.
 *
 * @param prevParams - Previous query parameters
 * @param newParams - New query parameters
 */
export function isQueryParamsChanged(
  prevParams: ExecuteQueryParams | undefined,
  newParams: ExecuteQueryParams,
): boolean {
  if (!prevParams && newParams) {
    return true;
  }
  const isSimplySerializableParamsChanged = simplySerializableParamNames.some(
    (paramName) => !isEqual(prevParams?.[paramName], newParams[paramName]),
  );

  const { filters: prevFilterList, relations: prevRelationsList } = getFilterListAndRelations(
    prevParams?.filters,
  );
  const { filters: newFilterList, relations: newRelationsList } = getFilterListAndRelations(
    newParams?.filters,
  );

  // TODO: check if relations are changed
  // Function has to compare logical structure of relations, not just references
  const isSliceFiltersChanged = isFiltersChanged(prevFilterList, newFilterList);
  const isFilterRelationsChanged =
    isSliceFiltersChanged ||
    isRelationsChanged(prevFilterList, newFilterList, prevRelationsList, newRelationsList);
  const isHighlightFiltersChanged = isFiltersChanged(prevParams!.highlights, newParams.highlights);

  return (
    isSimplySerializableParamsChanged ||
    isSliceFiltersChanged ||
    isHighlightFiltersChanged ||
    isFilterRelationsChanged
  );
}
