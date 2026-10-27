import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { TranslatableError } from '@/infra/translation/translatable-error';

/**
 * Lets a widget show its own loading state while the Sisense app initializes, for widgets that
 * set `shouldSkipSisenseContextWaiting`. Like the decorator, it throws outside a
 * `SisenseContextProvider`.
 * @returns Whether the Sisense app is ready.
 * @internal
 */
export function useWidgetContextGate(): { isContextReady: boolean } {
  const { app, isInitialized } = useSisenseContext();
  if (!isInitialized) {
    throw new TranslatableError('errors.noSisenseContext');
  }
  return { isContextReady: !!app };
}
