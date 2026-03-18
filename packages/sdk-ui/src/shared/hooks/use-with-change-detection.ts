import { useCallback, useMemo } from 'react';

import cloneDeep from 'lodash-es/cloneDeep';

import { AnyObject } from '@/shared/utils/utility-types';

// A default merger function that merges a delta object into an existing object.
export const defaultMerger = <P extends AnyObject>(existingValue: P, delta: Partial<P>) => {
  return {
    ...cloneDeep(existingValue),
    ...delta,
  };
};

type UseWithChangeDetectionParams<P extends AnyObject, E extends object = Partial<P>> = {
  target: P | P[];
  onChange: (event: E, index?: number) => void;
};

/**
 * A hook that extends a target object (or array of objects) with change detection functionality.
 * It monitors changes and triggers the provided `onChange` callback whenever a change occurs.
 *
 * This hook can handle both single object and array of objects.
 *
 * @internal
 */
export function useWithChangeDetection<P extends AnyObject, E extends object = Partial<P>>(
  params: UseWithChangeDetectionParams<P, E>,
) {
  const { target, onChange: globalOnChange } = params;
  const isMultipleTargets = Array.isArray(target);
  const targets = useMemo(
    () => (isMultipleTargets ? target : [target]),
    [isMultipleTargets, target],
  );

  const handleChange = useCallback(
    (event: E, index: number) => {
      // Fire the onChange callback if provided in the object
      if (targets[index] && 'onChange' in targets[index]) {
        (targets[index] as unknown as { onChange: (event: E) => void }).onChange(event);
      }

      // Fire the global onChange callback to notify the parent of changes
      globalOnChange(event, isMultipleTargets ? index : undefined);
    },
    [targets, isMultipleTargets, globalOnChange],
  );

  // Return the updated props with the onChange handler injected
  return useMemo(() => {
    const extendedTargets = targets.map((targetItem, index) => ({
      ...targetItem,
      onChange: (event: E) => handleChange(event, index),
    }));
    return isMultipleTargets ? extendedTargets : extendedTargets[0];
  }, [isMultipleTargets, targets, handleChange]);
}
