import type { GetWidgetModelParams } from '@sisense/sdk-ui-preact';
import { useGetWidgetModel as useGetWidgetModelPreact } from '@sisense/sdk-ui-preact';

export const useGetWidgetModel = async (params: GetWidgetModelParams) => {
  const data = await useGetWidgetModelPreact(params);
  return { data };
};
