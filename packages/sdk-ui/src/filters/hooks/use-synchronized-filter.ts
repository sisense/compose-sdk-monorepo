import { usePrevious } from '@/common/hooks/use-previous';
import { TranslatableError } from '@/translation/translatable-error';
import { Filter } from '@ethings-os/sdk-data';
import { useEffect, useState, useCallback } from 'react';

/**
 * Filter tiles supposed to be Controlled components (stateless) and to react on passed `filter`.
 * But to achieve backward compatibility, we also need to handle `filter` as internal state
 * in case of using Filter tile as Uncontrolled component (statefull).
 *
 * This hook helps with synchronization for both patterns.
 */
export function useSynchronizedFilter<TFilter extends Filter = Filter>(
  filterFromProps: TFilter | null,
  updateFilterFromProps: (filter: TFilter) => void,
  createEmptyFilter?: () => TFilter,
) {
  if (!filterFromProps && !createEmptyFilter) {
    throw new TranslatableError('errors.synchronizedFilterInvalidProps');
  }
  const initialFilter = filterFromProps || createEmptyFilter!();

  const [filter, setFilter] = useState<TFilter>(initialFilter);
  const prevFilterFromProps = usePrevious(filterFromProps);
  useEffect(() => {
    if (
      filterFromProps &&
      (!prevFilterFromProps || !isFiltersEqual(prevFilterFromProps, filterFromProps))
    ) {
      setFilter(filterFromProps);
    }
  }, [filterFromProps, prevFilterFromProps]);

  const updateFilter = useCallback(
    (newFilter: TFilter) => {
      setFilter(newFilter);
      updateFilterFromProps(newFilter);
    },
    [updateFilterFromProps],
  );

  return {
    filter,
    updateFilter,
  };
}

/**
 * Compares 2 filters on equality.
 * `name` property of filter contains hash of relevant filter's properties,
 * so filters will be decided as equal if they are identical, but have different guids.
 */
function isFiltersEqual(filter1: Filter, filter2: Filter): boolean {
  return filter1 === filter2 || filter1.name === filter2.name;
}
