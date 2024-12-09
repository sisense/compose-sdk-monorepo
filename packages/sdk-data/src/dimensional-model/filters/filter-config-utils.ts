import isEqual from 'lodash-es/isEqual.js';
import { guidFast } from '../../utils.js';
import {
  BaseFilterConfig,
  CompleteBaseFilterConfig,
  CompleteMembersFilterConfig,
  MembersFilterConfig,
} from '../interfaces.js';

/**
 * Returns a default configuration for a base filter.
 * @internal
 */
export const getDefaultBaseFilterConfig = (): CompleteBaseFilterConfig => ({
  guid: guidFast(13),
  disabled: false,
  locked: false,
});

/**
 * Returns a default configuration for a members filter.
 * @internal
 */
export const getDefaultMembersFilterConfig = (): CompleteMembersFilterConfig => ({
  ...getDefaultBaseFilterConfig(),
  excludeMembers: false,
  enableMultiSelection: true,
  deactivatedMembers: [],
});

/**
 * Checks whether the given configuration is a members filter configuration.
 * @param config - The filter configuration.
 * @returns Whether the configuration is a members filter configuration.
 * @internal
 */
export function isMembersFilterConfig(
  config: BaseFilterConfig | MembersFilterConfig,
): config is MembersFilterConfig {
  return 'excludeMembers' in config;
}

/**
 * Simplifies the filter configuration by removing default values.
 * @param config - The filter configuration.
 * @returns The simplified filter configuration.
 * @internal
 */
export const simplifyFilterConfig = (
  config: BaseFilterConfig | MembersFilterConfig,
): BaseFilterConfig | MembersFilterConfig => {
  const defaultConfig = isMembersFilterConfig(config)
    ? getDefaultMembersFilterConfig()
    : getDefaultBaseFilterConfig();

  // Filter out properties that match their default values
  const simplifiedConfig = Object.fromEntries(
    Object.entries(config).filter(
      ([key, value]) => !isEqual(value, defaultConfig[key as keyof MembersFilterConfig]),
    ),
  );

  return simplifiedConfig;
};
