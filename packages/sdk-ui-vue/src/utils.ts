import { isRef, toRaw, toValue } from 'vue';
import { values } from 'lodash';
import type { MaybeRef, MaybeWithRefs } from './types';

export function toPlainValue<T>(value: MaybeRef<T>): T {
  return isRef(value) ? toRaw(toValue(value)) : value;
}

export function toPlainValues<T extends object>(
  refObj: T,
): { [K in keyof T]: T[K] extends MaybeRef<infer R> ? R : T[K] } {
  const obj: any = {};
  Object.keys(refObj).forEach((key) => {
    obj[key] = toPlainValue(refObj[key as keyof T]);
  });
  return obj;
}

export function collectRefs<T extends {}>(objectWithRefs: MaybeWithRefs<T>) {
  return values(objectWithRefs).filter((value) => isRef(value));
}
