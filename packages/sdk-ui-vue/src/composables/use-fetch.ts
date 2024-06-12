import { useReducer } from '../helpers/use-reducer';
import { getSisenseContext } from '../providers';
import { collectRefs, toPlainValue, toPlainObject } from '../utils';
import type { DataState, RequestConfig } from '@sisense/sdk-ui-preact';
import { dataLoadStateReducer } from '@sisense/sdk-ui-preact';
import { toRefs, watch, type ToRefs } from 'vue';
import { useTracking } from './use-tracking';
import type { MaybeRef, MaybeRefOrWithRefs } from '../types';
import type { HttpClient } from '@sisense/sdk-rest-client';

/**
 * The options for the `useFetch` composable function.
 */
export type UseFetchOptions = {
  /** The request configuration object. */
  requestConfig?: RequestConfig;
  /** A boolean indicating whether the fetch operation is enabled. */
  enabled?: boolean;
};

/**
 * A Vue composable function `useFetch` that allows to make authorized fetch request to any Sisense API.
 *
 * @param path - The endpoint path to fetch data from. This should be a relative path like '/api/v1/endpoint'
 * @param init - The request init object
 * @param options - The additional request options
 *
 * @example
 * How to use `useFetch` within a Vue component to fetch and display widget information:
 * ```vue
 * <script setup>
 * import { ref } from "vue";
 * import { useFetch } from "./composables/useFetch";
 *
 * const enabled = ref(true);
 * const { data, isLoading, isError, error } = useFetch(
 *   "api/v1/elasticubes/getElasticubes",
 *   {
 *     method: "POST",
 *   },
 *   {
 *     enabled,
 *   });
 * </script>
 * ```
 *
 * The composable returns an object with reactive properties that represent the state of the data fetch operation:
 * - `data`: The fetched data, which is `undefined` until the operation is successfully completed.
 * - `isLoading`: A boolean indicating whether the fetch operation is currently in progress.
 * - `isError`: A boolean indicating whether an error occurred during the fetch operation.
 * - `isSuccess`: A boolean indicating whether the fetch operation was successfully completed without any errors.
 * - `error`: An error object containing details about any errors that occurred during the fetch operation.
 *
 * @group Fusion Embed
 * @fusionEmbed
 */
export const useFetch = <TData = unknown>(
  path: MaybeRef<string>,
  init?: MaybeRefOrWithRefs<RequestInit>,
  options?: MaybeRefOrWithRefs<UseFetchOptions>,
): ToRefs<DataState<TData>> => {
  const { hasTrackedRef } = useTracking('useFetch');
  const [dataState, dispatch] = useReducer(dataLoadStateReducer<TData>, {
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
    data: undefined,
  });

  const context = getSisenseContext();

  const sendHttpRequest = async (httpClient: HttpClient) => {
    try {
      dispatch({ type: 'loading' });
      const plainPath = toPlainValue(path);
      const plainInit = init ? toPlainObject(init) : {};
      const plainOptions = options ? toPlainObject(options) : {};
      const httpClientOptions = {
        requestConfig: plainOptions.requestConfig ? toPlainObject(plainOptions.requestConfig) : {},
        skipTrackingParam: true,
      };

      const data = await httpClient.call<TData>(
        httpClient.url + plainPath,
        plainInit,
        httpClientOptions,
      );

      dispatch({ type: 'success', data });
    } catch (error) {
      dispatch({ type: 'error', error: error as Error });
    }
  };

  watch(
    [...collectRefs(path, init, options), context],
    () => {
      const { app } = context.value;
      const enabled = toPlainObject(options || {}).enabled;
      const isEnabled = enabled === undefined || enabled === true;
      if (!app || !isEnabled) return;
      sendHttpRequest(app.httpClient);
    },
    { immediate: true },
  );

  return toRefs(dataState.value);
};
