import { onMounted, reactive, ref, toRefs, watch, type ToRefs } from 'vue';
import { getFilterListAndRelations } from '@sisense/sdk-data';
import {
  executeQuery,
  queryStateReducer,
  type ExecuteQueryParams,
  type QueryState,
} from '@sisense/sdk-ui-preact';
import { getApp } from '../providers/sisense-context-provider';
import { useReducer } from '../helpers/use-reducer';
import type { MaybeWithRefs } from '../types';
import { collectRefs, toPlainValue } from '../utils';

/**
 * A hook function that executes a data query.
 * TODO Document
 *
 *
 * @returns TODO
 */
export const useExecuteQuery = (params: MaybeWithRefs<ExecuteQueryParams>) => {
  const [queryState, dispatch] = useReducer(queryStateReducer, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  // todo: retrive app ref directly from context
  const app = ref();
  getApp().then((appInstance) => (app.value = appInstance));

  const runExecuteQuery = async () => {
    try {
      const {
        dataSource,
        dimensions,
        measures,
        filters,
        highlights,
        count,
        offset,
        onBeforeQuery,
        enabled,
      } = params;
      const { filters: filterList, relations: filterRelations } = getFilterListAndRelations(
        toPlainValue(filters),
      );
      const isEnabled = !(toPlainValue(enabled) ?? true);

      if (isEnabled || !app.value) {
        return;
      }

      dispatch({ type: 'loading' });

      const data = await executeQuery(
        {
          dataSource: toPlainValue(dataSource),
          dimensions: toPlainValue(dimensions),
          measures: toPlainValue(measures),
          filters: filterList,
          filterRelations,
          highlights: toPlainValue(highlights),
          count: toPlainValue(count),
          offset: toPlainValue(offset),
        },
        app.value,
        { onBeforeQuery: toPlainValue(onBeforeQuery) },
      );

      dispatch({ type: 'success', data });
    } catch (error) {
      dispatch({ type: 'error', error: error as Error });
    }
  };

  watch([...collectRefs(params), app], () => {
    runExecuteQuery();
  });

  onMounted(() => {
    runExecuteQuery();
  });

  return toRefs(reactive(queryState.value)) as ToRefs<QueryState>;
};
