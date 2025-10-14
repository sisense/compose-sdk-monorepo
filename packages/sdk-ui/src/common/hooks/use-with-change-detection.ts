import { useCallback, useMemo } from 'react';

import cloneDeep from 'lodash-es/cloneDeep';
import mergeWith from 'lodash-es/mergeWith';

import { AnyObject } from '@/utils/utility-types';

// A default merger function that merges a delta object into an existing object.
export const defaultMerger = <P extends AnyObject>(existingValue: P, delta: Partial<P>) => {
  return mergeWith(cloneDeep(existingValue), delta, (objValue, srcValue) => {
    if (Array.isArray(srcValue)) {
      return srcValue;
    }
    return undefined;
  });
};

type UseWithChangeDetectionParams<P extends AnyObject> = {
  target: P | P[];
  onChange: (delta: Partial<P>, index?: number) => void;
};

/**
 * A hook that extends a target object (or array of objects) with change detection functionality.
 * It monitors changes and triggers the provided `onChange` callback whenever a change occurs.
 *
 * This hook can handle both single object and array of objects.
 *
 * @internal
 */
export function useWithChangeDetection<P extends AnyObject>(
  params: UseWithChangeDetectionParams<P>,
) {
  const { target, onChange: globalOnChange } = params;
  const isMultipleTargets = Array.isArray(target);
  const targets = useMemo(
    () => (isMultipleTargets ? target : [target]),
    [isMultipleTargets, target],
  );

  const handleChange = useCallback(
    (delta: Partial<P>, index: number) => {
      // Fire the onChange callback if provided in the object
      if (targets[index] && 'onChange' in targets[index]) {
        targets[index].onChange(delta);
      }

      // Fire the global onChangeCallback to notify the parent of changes
      globalOnChange(delta, isMultipleTargets ? index : undefined);
    },
    [targets, isMultipleTargets, globalOnChange],
  );

  // Return the updated props with the onChange handler injected
  return useMemo(() => {
    const extendedTargets = targets.map((target, index) => ({
      ...target,
      onChange: (delta: Partial<P>) => handleChange(delta, index),
    }));
    return isMultipleTargets ? extendedTargets : extendedTargets[0];
  }, [isMultipleTargets, targets, handleChange]);
}
