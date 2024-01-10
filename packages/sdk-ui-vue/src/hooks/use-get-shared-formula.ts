import type { GetSharedFormulaParams } from '@sisense/sdk-ui-preact';
import { useGetSharedFormula as useGetSharedFormulaPreact } from '@sisense/sdk-ui-preact';

export const useGetSharedFormula = async (params: GetSharedFormulaParams) => {
  const data = await useGetSharedFormulaPreact(params);
  return { data };
};
