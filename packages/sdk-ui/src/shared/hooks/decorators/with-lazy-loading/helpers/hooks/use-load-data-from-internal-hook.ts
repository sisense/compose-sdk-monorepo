import { AnyArray, RestApiHookState } from '@/shared/utils/utility-types';

import {
  DataChunk,
  HookExecutionStatus,
  RestApiHookParams,
  Slice,
  SliceableRestApiHook,
  UnsliceableParams,
} from '../../types.js';

type UseLoadDataFromInternalHookOptions<
  HookParams extends RestApiHookParams,
  DataKey extends string,
  SuccessDataType extends AnyArray,
  Hook extends SliceableRestApiHook<HookParams, DataKey, SuccessDataType>,
> = {
  hook: Hook;
  params: UnsliceableParams<HookParams>;
  sliceToLoad: Slice;
  dataKey: DataKey;
};

type UseLoadDataFromInternalHookResult<DataKey extends string, SuccessDataType extends AnyArray> = {
  dataChunk: DataChunk | null;
  hookExecutionStatus: HookExecutionStatus;
  dataLoadingError: Error | undefined;
  hookResultState: RestApiHookState<DataKey, SuccessDataType>;
};

export function useLoadDataFromInternalHook<
  HookParams extends RestApiHookParams,
  DataKey extends string,
  SuccessDataType extends AnyArray,
  Hook extends SliceableRestApiHook<HookParams, DataKey, SuccessDataType>,
>(
  options: UseLoadDataFromInternalHookOptions<HookParams, DataKey, SuccessDataType, Hook>,
): UseLoadDataFromInternalHookResult<DataKey, SuccessDataType> {
  const { hook, params, sliceToLoad, dataKey } = options;
  const hookParams = { ...params, ...sliceToLoad } as HookParams;
  const hookResultState = hook(hookParams);

  const dataChunk =
    hookResultState.status === 'success'
      ? { slice: sliceToLoad, data: hookResultState[dataKey] }
      : null;

  const dataLoadingError = hookResultState.isError ? hookResultState.error : undefined;

  return {
    dataChunk,
    hookExecutionStatus: hookResultState.status,
    dataLoadingError,
    hookResultState,
  };
}
