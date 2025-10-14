import { AnyArray } from '@/utils/utility-types';

import { useHasChanged } from '../../use-has-changed';
import {
  useDataAccumulation,
  useGetHookStateResult,
  useGetLoadMoreFunction,
  useLoadDataFromInternalHook,
  useManageSliceToLoad,
} from './helpers/hooks';
import { calculateIfAllItemsLoaded } from './helpers/utils';
import {
  HookWithLazyLoading,
  LazyLoadingConfig,
  RestApiHookParams,
  SliceableRestApiHook,
  UnsliceableParams,
} from './types';

/**
 * A decorator that adds lazy loading functionality to a hook.
 *
 */
export const withLazyLoading =
  (config: LazyLoadingConfig) =>
  <HookParams extends RestApiHookParams, DataKey extends string, SuccessDataType extends AnyArray>(
    /**
     * The hook to decorate. It should be a sliceable hook (i.e. it should accept `count` and `offset` parameters).
     */
    hook: SliceableRestApiHook<HookParams, DataKey, SuccessDataType>,
  ): HookWithLazyLoading<HookParams, DataKey, SuccessDataType, typeof hook> => {
    return (params: UnsliceableParams<HookParams>) => {
      const areParamsChanged = useHasChanged(params);
      const { accumulatedData, addData, isDataReset } = useDataAccumulation({
        shouldBeReset: areParamsChanged,
      });

      const { sliceToLoad, increaseSliceToLoad } = useManageSliceToLoad({
        initialCount: config.initialCount,
        chunkSize: config.chunkSize,
        accumulatedData,
        shouldBeReset: areParamsChanged,
      });

      const { dataChunk, hookExecutionStatus, dataLoadingError } = useLoadDataFromInternalHook({
        hook,
        params,
        sliceToLoad,
        dataKey: config.dataKey,
      });
      addData(dataChunk);

      const isAllItemsLoaded = calculateIfAllItemsLoaded(dataChunk);

      const isLoadMoreRequestsForbidden =
        isAllItemsLoaded || hookExecutionStatus !== 'success' || areParamsChanged;

      return useGetHookStateResult({
        status: hookExecutionStatus,
        dataKey: config.dataKey,
        data: accumulatedData.flatMap((chunk) => chunk.data),
        loadMore: useGetLoadMoreFunction({
          increaseSliceToLoad,
          isLoadMoreRequestsForbidden,
        }),
        error: dataLoadingError,
        isDataReset,
      });
    };
  };
