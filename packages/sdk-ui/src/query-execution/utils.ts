import { PivotQueryDescription, QueryDescription } from '@/query/execute-query';
import { getFilterListAndRelationsJaql } from '@sisense/sdk-data';
import { ExecutePivotQueryParams, ExecuteQueryParams } from './types';

export function convertToQueryDescription<T extends ExecuteQueryParams | ExecutePivotQueryParams>(
  params: T,
): T extends ExecutePivotQueryParams ? PivotQueryDescription : QueryDescription {
  const { filters } = params;
  const { filters: pureFilters, relations } = getFilterListAndRelationsJaql(filters);

  return {
    ...params,
    filters: pureFilters || [],
    filterRelations: relations,
  };
}
