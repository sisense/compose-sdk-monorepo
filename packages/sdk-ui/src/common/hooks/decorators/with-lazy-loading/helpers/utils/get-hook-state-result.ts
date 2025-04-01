import { AnyArray, RestApiHookState } from '@/utils/utility-types';
import { HookExecutionStatus, WithLoadMore } from '../../types';

export function getHookStateResult<
  DataKey extends string,
  SuccessDataType extends AnyArray,
>(options: {
  status: HookExecutionStatus;
  dataKey: DataKey;
  data: SuccessDataType;
  loadMore: () => void;
  error?: Error;
}): WithLoadMore<RestApiHookState<DataKey, SuccessDataType>> {
  const { status, dataKey, data, loadMore, error } = options;
  switch (status) {
    case 'loading':
      return {
        isLoading: true,
        isError: false,
        isSuccess: false,
        error: undefined,
        status: 'loading',
        [dataKey]: data.length ? data : undefined,
        loadMore,
      };
    case 'success':
      return {
        isLoading: false,
        isError: false,
        isSuccess: true,
        error: undefined,
        status: 'success',
        [dataKey]: data,
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
