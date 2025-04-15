import { usePrevious } from '@/common/hooks/use-previous.js';
import { AnyArray, RestApiHookState } from '@/utils/utility-types';
import { HookExecutionStatus, WithLoadMore } from '../../types.js';

export function useGetHookStateResult<
  DataKey extends string,
  SuccessDataType extends AnyArray,
>(options: {
  status: HookExecutionStatus;
  dataKey: DataKey;
  data: SuccessDataType;
  loadMore: () => void;
  isDataReset: boolean;
  error?: Error;
}): WithLoadMore<RestApiHookState<DataKey, SuccessDataType>> {
  const { status, dataKey, data, loadMore, error, isDataReset } = options;
  const prevStatus = usePrevious(status);
  const prevData = usePrevious(data);
  const wasDataCached = prevStatus === 'success' && status === 'success' && prevData !== data;
  // data reset causes accumulated data to be empty at least for one render
  // but if the new data synchronously taken from the cache ('success' -> 'success'),
  // we want to return the previous data (instead of empty) for this render to avoid flickering
  const dataToReturn = wasDataCached && isDataReset ? prevData : data;
  switch (status) {
    case 'loading':
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        error: undefined,
        status: 'loading',
        [dataKey]: dataToReturn && dataToReturn.length ? dataToReturn : undefined,
        loadMore,
      };
    case 'success':
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: undefined,
        status: 'success',
        [dataKey]: dataToReturn,
        loadMore,
      };
    case 'error':
      return {
        isLoading: false,
        isError: true,
        isSuccess: false,
        error: error!,
        status: 'error',
        [dataKey]: undefined,
        loadMore,
      };
    default:
      throw new Error('Invalid hook status');
  }
}
