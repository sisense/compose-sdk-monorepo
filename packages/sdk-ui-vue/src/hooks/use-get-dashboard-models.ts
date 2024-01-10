import type { GetDashboardModelsParams } from '@sisense/sdk-ui-preact';
import { useGetDashboardModels as useGetDashboardModelsPreact } from '@sisense/sdk-ui-preact';

export const useGetDashboardModels = async (params: GetDashboardModelsParams) => {
  const data = await useGetDashboardModelsPreact(params);
  return { data };
};
