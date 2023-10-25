import { I18NextInstance } from '@sisense/sdk-common';
import { useEffect, useState } from 'react';
import { initializeI18n } from './initialize-i18n';

export function useInitializedI18n(): I18NextInstance | null {
  const [i18n, setI18n] = useState<I18NextInstance | null>(null);
  useEffect(() => {
    void initializeI18n().initPromise.then((initializedI18n) => setI18n(initializedI18n));
  }, []);
  return i18n;
}
