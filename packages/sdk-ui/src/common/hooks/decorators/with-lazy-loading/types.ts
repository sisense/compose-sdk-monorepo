import { AnyArray, AnyObject, RestApiHookState } from '@/utils/utility-types';

export type Slice = {
  count: number;
  offset: number;
};

type Sliceable = Partial<Slice>;
type Enableable = { enabled?: boolean };

export type RestApiHookParams = Sliceable & Enableable & AnyObject;

export type UnsliceableParams<Params extends RestApiHookParams> = Omit<Params, keyof Slice>;

export type LazyLoadingConfig = {
  initialCount: number;
  chunkSize: number;
  dataKey: string;
};

export type SliceableRestApiHook<
  Params extends RestApiHookParams,
  DataKey extends string,
  SuccessDataType extends AnyArray,
> = (params: Params) => RestApiHookState<DataKey, SuccessDataType>;

export type WithLoadMore<ReturnObject> = ReturnObject & {
  loadMore: () => void;
};

export type HookWithLazyLoading<
  HookParams extends RestApiHookParams,
  DataKey extends string,
  SuccessDataType extends AnyArray,
  Hook extends SliceableRestApiHook<HookParams, DataKey, SuccessDataType>,
> = (params: UnsliceableParams<HookParams>) => WithLoadMore<ReturnType<Hook>>;

export type DataChunk = {
  slice: Slice;
  data: AnyArray;
};

export type HookExecutionStatus = 'success' | 'error' | 'loading';
