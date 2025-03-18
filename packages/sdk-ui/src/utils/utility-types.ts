/**
 * Generic utility type that allows you to merge union type
 *
 * @example
 * type T1 = {
 *   a: string;
 *   b?: number;
 * };
 * type T2 = {
 *   a: string;
 *   c: number;
 * };
 * type T3 = {
 *   a: number;
 *   d: string;
 * }
 * type MergedT = Merge<T1 | T2 | T3>;
 * /*
 * {
 *   a: string | number;
 *   b?: number;
 *   c?: number;
 *   d?: string;
 * };
 */
export type Merge<T extends object> = {
  [k in CommonKeys<T>]: PickTypeOf<T, k>;
} & {
  [k in NonCommonKeys<T>]?: PickTypeOf<T, k>;
};

type CommonKeys<T extends object> = keyof T;

type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any } ? T[K] : undefined;

type AllKeys<T> = T extends any ? keyof T : never;

type NonCommonKeys<T extends object> = Subtract<AllKeys<T>, CommonKeys<T>>;

type Subtract<A, C> = A extends C ? never : A;

type PickTypeOf<T, K extends string | number | symbol> = K extends AllKeys<T>
  ? PickType<T, K>
  : never;

/**
 * Abstract object with any unknown values
 */
export type AnyObject = Record<string, any>;

/**
 * Empty object with no properties
 */
export type EmptyObject = Record<string, never>;

/**
 * Allows you to make a property of an object required.
 *
 * @example
 * type T = {
 *   a: string;
 *   b?: number;
 *   c?: boolean;
 * };
 *
 * type TRequiredB = WithRequiredProp<T, 'b'>; // { a: string; b: number; c?: boolean; }
 */
export type WithRequiredProp<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Universal generic state for hooks that fetch data from the REST API.
 */
export type RestApiHookState<DataKey extends string, SuccessDataType extends AnyObject> =
  | RestApiHookSuccessState<DataKey, SuccessDataType>
  | RestApiHookErrorState<DataKey>
  | RestApiHookLoadingState<DataKey>;

/** Success state of the REST API hook */
export type RestApiHookSuccessState<DataKey extends string, SuccessDataType extends AnyObject> = {
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
