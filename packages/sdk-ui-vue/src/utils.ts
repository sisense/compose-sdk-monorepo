import { isRef, toRaw, toValue } from 'vue';
import { values } from 'lodash';
import type { MaybeRef, MaybeWithRefs } from './types';

export function toPlainValue<T>(value: MaybeRef<T>): T {
  return isRef(value) ? toRaw(toValue(value)) : value;
}

export function collectRefs<T extends {}>(objectWithRefs: MaybeWithRefs<T>) {
  return values(objectWithRefs).filter((value) => isRef(value));
}
