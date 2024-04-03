import { SisenseContextProviderProps } from '@/props';

const {
  VITE_APP_SISENSE_URL,
  VITE_APP_SISENSE_TOKEN,
  VITE_APP_SISENSE_WAT,
  VITE_APP_SISENSE_SSO_ENABLED,
} = import.meta.env;

export const sisenseContextProviderProps: SisenseContextProviderProps = (() => {
  const baseOptions: SisenseContextProviderProps = {
    url: VITE_APP_SISENSE_URL || '',
    defaultDataSource: 'Sample ECommerce',
    appConfig: {},
  };
  const wat = VITE_APP_SISENSE_WAT;
  const token = VITE_APP_SISENSE_TOKEN;
  const ssoEnabled = VITE_APP_SISENSE_SSO_ENABLED;

  if (ssoEnabled && ssoEnabled?.toLowerCase() === 'true') {
    return { ...baseOptions, ssoEnabled: true };
  } else if (wat) {
    return { ...baseOptions, wat };
  } else if (token) {
    return { ...baseOptions, token };
  } else {
    return baseOptions;
  }
})();
