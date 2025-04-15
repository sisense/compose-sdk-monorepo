import { useMemo } from 'react';
import deepMerge from 'ts-deepmerge';
import type { DeepRequired } from 'ts-essentials';
import { AnyObject } from '@/utils/utility-types';

/**
 * Merges the provided configuration with the default configuration.
 *
 * @param config - The configuration to merge with the default configuration.
 * @param defaults - The default configuration.
 * @returns The merged configuration.
 */
export const useDefaults = <Config extends AnyObject>(
  config: Config | undefined,
  defaults: DeepRequired<Config>,
): DeepRequired<Config> => {
  return useMemo(
    () =>
      deepMerge.withOptions({ mergeArrays: false }, defaults, config || {}) as DeepRequired<Config>,
    [config, defaults],
  );
};
