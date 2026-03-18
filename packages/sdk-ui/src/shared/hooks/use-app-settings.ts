import type { AppSettings } from '@/infra/app/settings/settings';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

/**
 * Hook that returns the full application settings from SisenseContext.
 *
 * Use this to access app settings (language, user role, LLM quota settings, etc.)
 * when customizing components wrapped inside SisenseContextProvider.
 *
 * @returns AppSettings when app is initialized, undefined otherwise
 *
 * @sisenseInternal
 */
export const useAppSettings = (): AppSettings | undefined => {
  const { app } = useSisenseContext();
  return app?.settings;
};
