import type { Ref } from 'vue';

export type MaybeRef<T> = Ref<T> | T;
export type MaybeWithRefs<T extends object> = {
  [Property in keyof T]: MaybeRef<T[Property]>;
};
export type MaybeRefOrWithRefs<T extends Object> = MaybeRef<T> | MaybeWithRefs<T>;
