import {
  HookAdapter,
  type SharedFormulaState,
  useGetSharedFormulaInternal,
  type UseGetSharedFormulaParams,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, toRefs, watch } from 'vue';

import { createSisenseContextConnector } from '../helpers/context-connectors';
import { useRefState } from '../helpers/use-ref-state';
import type { MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

/**
 * A Vue composable function `useGetSharedFormula` for retrieving shared formulas from Sisense.
 * This function enables fetching a shared formula either by its unique OID or by its name and associated data source,
 * providing flexibility in how shared formulas are accessed. It manages the fetch operation's state, including loading,
 * success, and error states, offering a reactive way to integrate Sisense formulas into Vue applications.
 *
 * @param {MaybeRefOrWithRefs<UseGetSharedFormulaParams>} params - Parameters for fetching the shared formula, including the formula's OID,
 * or its name and the data source. This allows for precise specification of the formula to be fetched, supporting dynamic
 * values through Vue refs for reactive fetching based on user interactions or other application states.
 *
 * @example
 * How to use `useGetSharedFormula` within a Vue component to fetch a shared formula:
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useGetSharedFormula } from '@sisense/sdk-ui-vue';
 *
 * // To fetch by OID
 * const paramsByOid = ref({
 *   oid: 'your_formula_oid',
 * });
 *
 * // Or to fetch by name and dataSource
 * const paramsByName = ref({
 *   name: 'your_formula_name',
 *   dataSource: 'your_data_source_id',
 * });
 *
 * const { formula, isLoading, isError, isSuccess, error } = useGetSharedFormula(paramsByOid);
 * // Or use `paramsByName` instead of `paramsByOid` depending on the fetching method
 * </script>
 *
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="isError">Error: {{ error?.message }}</div>
 *   <div v-else-if="formula">{{ formula }}</div>
 * </template>
 * ```
 *
 * The composable returns an object with reactive properties to manage the state of the shared formula fetching process:
 * - `formula`: The fetched shared formula, which is `undefined` until the operation completes successfully, or `null` if not found. It can be either a `CalculatedMeasure` or `DimensionalCalculatedMeasure` based on the fetch result.
 * - `isLoading`: Indicates whether the fetch operation is currently in progress.
 * - `isError`: Indicates whether an error occurred during the fetch operation.
 * - `isSuccess`: Indicates whether the fetch operation completed successfully without any errors.
 * - `error`: Contains the error object if an error occurred during the fetch.
 * - `status`: The status of the fetch operation ('loading', 'success', or 'error').
 *
 * This composable provides a streamlined, reactive approach to fetching shared formulas from Sisense, facilitating their integration into Vue applications for enhanced data analytics capabilities.
 * @group Fusion Assets
 * @fusionEmbed
 */
export const useGetSharedFormula = (params: MaybeRefOrWithRefs<UseGetSharedFormulaParams>) => {
  useTracking('useGetSharedFormula');

  const hookAdapter = new HookAdapter(useGetSharedFormulaInternal, [
    createSisenseContextConnector(),
  ]);

  const [formulaState, setFormulaState] = useRefState<SharedFormulaState>({
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    formula: null,
  });

  hookAdapter.subscribe((result) => {
    setFormulaState(result);
  });

  hookAdapter.run(toPlainObject(params));

  watch([...collectRefs(params)], () => {
    hookAdapter.run(toPlainObject(params));
  });

  onBeforeUnmount(() => {
    hookAdapter.destroy();
  });

  return toRefs(formulaState.value);
};
