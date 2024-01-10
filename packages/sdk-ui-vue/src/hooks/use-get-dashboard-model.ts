import type { GetDashboardModelParams } from '@sisense/sdk-ui-preact';
import { useGetDashboardModel as useGetDashboardModelPreact } from '@sisense/sdk-ui-preact';

export const useGetDashboardModel = async (params: GetDashboardModelParams) => {
  const data = await useGetDashboardModelPreact(params);
  return { data };
};
