import { AnyArray, AnyObject } from './basic-utility-types';

/**
 * Universal generic state for hooks that fetch data from the REST API.
 */
export type RestApiHookState<
  DataKey extends string,
  SuccessDataType extends AnyObject | AnyArray,
> =
  | RestApiHookSuccessState<DataKey, SuccessDataType>
  | RestApiHookErrorState<DataKey>
  | RestApiHookLoadingState<DataKey>;

/** Success state of the REST API hook */
export type RestApiHookSuccessState<
  DataKey extends string,
  SuccessDataType extends AnyObject | AnyArray,
> = {
  isLoading: false;
  isError: false;
  isSuccess: true;
  error: undefined;
  status: 'success';
} & {
  [key in DataKey]: SuccessDataType;
};

/** Error state of the REST API hook */
export type RestApiHookErrorState<DataKey extends string> = {
  isLoading: false;
  isError: true;
  isSuccess: false;
  error: Error;
  status: 'error';
} & {
  [key in DataKey]: undefined;
};

/** Loading state of the REST API hook */
export type RestApiHookLoadingState<DataKey extends string> = {
  isLoading: true;
  isError: false;
  isSuccess: false;
  error: undefined;
  status: 'loading';
} & {
  [key in DataKey]: undefined;
};
