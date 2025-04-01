import type { Ref } from 'vue';

export type MaybeRef<T> = Ref<T> | T;
export type MaybeWithRefs<T extends object> = {
  [Property in keyof T]: MaybeRef<T[Property]>;
};
export type MaybeRefOrWithRefs<T extends Object> = MaybeRef<T> | MaybeWithRefs<T>;

/**
 * Converts all non-function properties of `T` into Vue refs while keeping function properties specified by `Fns` unchanged.
 *
 * @internal
 */
export type ToRefsExceptFns<T, Fns extends keyof T> = {
  /** Converts non-function properties into Vue refs. */
  [K in keyof Omit<T, Fns>]: Ref<T[K]>;
} & Pick<T, Fns>; // Keeps function properties unchanged
