import { isRef, toRaw, toValue, type Ref } from 'vue';
import values from 'lodash/values';
import type { MaybeRef, MaybeWithRefs } from './types';

export function isObject(value: unknown): boolean {
  return value !== null && !Array.isArray(value) && typeof value === 'object';
}

export function toPlainValue<T>(value: MaybeRef<T>): T {
  return isRef(value) ? toRaw(toValue(value)) : value;
}

export function toPlainValues<T extends object>(refObj: MaybeRef<T> | MaybeWithRefs<T>): T {
  const objToIterate = toPlainValue(refObj);

  return Object.fromEntries(
    Object.entries(objToIterate).map(([key, value]) => [key, toPlainValue(value)]),
  ) as T;
}

export function collectRefs(
  ...params: (MaybeRef<unknown> | MaybeWithRefs<unknown>)[]
): Ref<unknown>[] {
  return params
    .map((param) => {
      if (isRef(param)) {
        return [param];
      }
      if (isObject(param)) {
        return values(param).filter(isRef);
      }
      return [];
    })
    .flat();
}
