import { CascadingFilter, Filter } from '@sisense/sdk-data';

export function isCascadingFilter(filter: Filter): filter is CascadingFilter {
  return filter instanceof CascadingFilter;
}
