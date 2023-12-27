import { getFilterListAndRelations } from '@sisense/sdk-data';
import type { ExecuteQueryParams } from '@sisense/sdk-ui-preact';
import { executeQuery } from '@sisense/sdk-ui-preact';
import { getApp } from '../providers/sisense-context-provider';

/**
 * A hook function that executes a data query.
 * TODO Document
 *
 *
 * @returns TODO
 */
export const useExecuteQuery = async (params: ExecuteQueryParams) => {
  const { dataSource, dimensions, measures, filters, highlights, count, offset, onBeforeQuery } =
    params;

  const app = await getApp();
  const { filters: filterList, relations: filterRelations } = getFilterListAndRelations(filters);
  const data = await executeQuery(
    {
      dataSource,
      dimensions,
      measures,
      filters: filterList,
      filterRelations,
      highlights,
      count,
      offset,
    },
    app,
    { onBeforeQuery },
  );

  return { data };
};
