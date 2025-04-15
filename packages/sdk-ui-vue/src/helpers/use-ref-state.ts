import { ref, type Ref } from 'vue';

type AnyObject = Record<string, any>;

export function updateRefObject<T extends AnyObject>(
  targetRef: Ref<T>,
  updateObj: Partial<T>,
): void {
  Object.assign(targetRef.value, updateObj);
}

export function useRefState<T>(initialValue?: T): [Ref<T>, (value: T) => void] {
  const state = ref(initialValue) as Ref<T>;

  function setState(value: T) {
    if (typeof value === 'object' && typeof state.value === 'object') {
      updateRefObject(state as Ref<AnyObject>, value as AnyObject);
    } else {
      state.value = value;
    }
  }

  return [state, setState];
}
