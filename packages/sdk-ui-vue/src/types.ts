import type { Ref } from 'vue';

export type MaybeRef<T> = Ref<T> | T;
export type MaybeWithRefs<T> = {
  [Property in keyof T]: Ref<T[Property]> | T[Property];
};
