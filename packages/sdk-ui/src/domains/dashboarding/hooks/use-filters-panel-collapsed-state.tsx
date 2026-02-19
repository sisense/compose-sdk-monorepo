import { useCallback, useState } from 'react';

/**
 * @internal
 */
export const LS_KEY_FILTERS_PANEL_COLLAPSED = 'csdk_dashboard_filters_panel_collapsed';

/**
 * @internal
 */
export const useFiltersPanelCollapsedState = (
  initialState = false,
  shouldUseLocalStorage = false,
): [boolean, (state: boolean) => void] => {
  const localStorageValue = localStorage.getItem(LS_KEY_FILTERS_PANEL_COLLAPSED);
  const localStorageState = localStorageValue ? localStorageValue === 'true' : undefined;
  const innerInitialState = shouldUseLocalStorage
    ? localStorageState ?? initialState
    : initialState;

  const [isCollapsed, setIsCollapsed] = useState(innerInitialState);

  const setAndStoreIsCollapsed = useCallback(
    (state: boolean) => {
      if (shouldUseLocalStorage) {
        localStorage.setItem(LS_KEY_FILTERS_PANEL_COLLAPSED, state ? 'true' : 'false');
      }
      setIsCollapsed(state);
    },
    [shouldUseLocalStorage],
  );

  return [isCollapsed, setAndStoreIsCollapsed];
};
