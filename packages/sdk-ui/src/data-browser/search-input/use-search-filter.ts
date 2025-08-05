import debounce from 'lodash-es/debounce';
import { useState, useCallback, useMemo, useEffect } from 'react';

const SEARCH_DEBOUNCE_TIME = 300;
type UseSearchFilterReturn = {
  /**
   * The search filter value to be used for querying the data.
   * Debounced by 300ms.
   */
  searchFilter: string;
  /**
   * The realtime search input value that is being typed by the user.
   */
  searchInputValue: string;
  /**
   * Update the search input value.
   */
  onSearchInputUpdate: (value: string) => void;
};
export const useSearchFilter = (initialValue?: string): UseSearchFilterReturn => {
  const [searchFilter, setSearchFilter] = useState(initialValue || '');
  const [searchInputValue, setSearchInputValue] = useState(initialValue || '');

  const debouncedSetSearchFilter = useMemo(
    () =>
      debounce((value: string) => {
        setSearchFilter(value);
      }, SEARCH_DEBOUNCE_TIME),
    [setSearchFilter],
  );

  // Cleanup: cancel pending debounced calls when the component unmounts
  useEffect(() => {
    return () => {
      debouncedSetSearchFilter.cancel();
    };
  }, [debouncedSetSearchFilter]);

  const onSearchInputUpdate = useCallback(
    (value: string) => {
      debouncedSetSearchFilter(value);
    },
    [debouncedSetSearchFilter],
  );

  return {
    searchFilter,
    searchInputValue,
    onSearchInputUpdate: (value: string) => {
      setSearchInputValue(value);
      onSearchInputUpdate(value);
    },
  };
};
