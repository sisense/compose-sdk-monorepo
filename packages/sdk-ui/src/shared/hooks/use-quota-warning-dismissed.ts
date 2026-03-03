import { useCallback, useState } from 'react';

const STORAGE_KEY = 'csdk-quota-warning-dismissed';

/**
 * Hook that manages quota warning dismissed state with sessionStorage persistence.
 * State survives navigation within the same tab but resets when the tab is closed.
 *
 * @returns Tuple of [dismissed, setDismissed]
 * @internal
 */
export function useQuotaWarningDismissed(): [boolean, (dismissed: boolean) => void] {
  const [dismissed, setDismissedState] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      console.debug('[useQuotaWarningDismissed] sessionStorage.getItem failed:', e);
      return false;
    }
  });

  const setDismissed = useCallback((value: boolean) => {
    setDismissedState(value);
    if (typeof window !== 'undefined') {
      try {
        if (value) {
          sessionStorage.setItem(STORAGE_KEY, 'true');
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.debug('[useQuotaWarningDismissed] sessionStorage setItem/removeItem failed:', e);
        // Ignore; in-memory state still updates, warning will show on next load
      }
    }
  }, []);

  return [dismissed, setDismissed];
}
