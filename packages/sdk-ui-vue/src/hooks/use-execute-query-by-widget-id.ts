import { getFilterListAndRelations } from '@sisense/sdk-data';
import type { ExecuteQueryByWidgetIdParams } from '@sisense/sdk-ui-preact';
import { executeQueryByWidgetId as executeQueryByWidgetIdPreact } from '@sisense/sdk-ui-preact';
import { getApp } from '../providers/sisense-context-provider';

export const useExecuteQueryByWidgetId = async (params: ExecuteQueryByWidgetIdParams) => {
  const { filters, ...rest } = params;

  const app = await getApp();
  const { filters: filterList } = getFilterListAndRelations(filters);
  const data = await executeQueryByWidgetIdPreact({
    ...rest,
    filters: filterList,
    app,
  });

  return { data };
};
