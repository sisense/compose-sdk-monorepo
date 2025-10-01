import { TranslatableError } from '@/translation/translatable-error';
import {
  Attribute,
  DimensionalLevelAttribute,
  Filter,
  filterFactory,
  isMembersFilter,
  MembersFilter,
} from '@ethings-os/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep.js';

/**
 * Clones a filter with a toggled 'disabled' state.
 *
 * @param filter - Filter to clone
 */
export const cloneFilterAndToggleDisabled = <TFilter extends Filter>(filter: TFilter): TFilter => {
  const newFilter = cloneFilter(filter);
  newFilter.config.disabled = !filter.config.disabled;
  return newFilter;
};

export const cloneFilter = <TFilter extends Filter>(filter: TFilter): TFilter => {
  const newFilter = cloneDeep(filter);
  Object.setPrototypeOf(newFilter, filter);
  return newFilter;
};

function createIncludeAllFilter(attribute: Attribute, guid: string, backgroundFilter?: Filter) {
  const config = {
    guid,
    ...(backgroundFilter ? { backgroundFilter } : {}),
  };
  return filterFactory.members(attribute, [], config);
}

export function clearMembersFilter(filter: Filter) {
  if (!isMembersFilter(filter)) {
    throw new TranslatableError('errors.notAMembersFilter');
  }
  const {
    attribute,
    config: { guid, backgroundFilter },
  } = filter;
  return createIncludeAllFilter(attribute, guid, backgroundFilter);
}

export function isIncludeAllFilter(filter: Filter) {
  return 'members' in filter && (filter as MembersFilter).members.length === 0;
}

/** @internal */
export function isSameAttribute(attributeA: Attribute, attributeB: Attribute) {
  return (
    attributeA.expression === attributeB?.expression &&
    (attributeA as DimensionalLevelAttribute).granularity ===
      (attributeB as DimensionalLevelAttribute).granularity
  );
}
