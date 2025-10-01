/**
 * Translation dictionary for English language.
 */
export const translation = {
  errorPrefix: '[request-error]',
  errors: {
    networkError: 'Network error. Check browser console for further details.',
    authFailed: 'Failed to authenticate.',
    ssoNotEnabled:
      'SSO is not enabled on target instance, please choose another authentication method.',
    ssoNoLoginUrl: 'Can not fetch login URL on target instance. Check SSO settings.',
    passwordAuthFailed:
      '$t(errorPrefix) Username and password authentication was not successful. Check credentials.',
    tokenAuthFailed: '$t(errorPrefix) Token authentication was not successful. Check credentials.',
    responseError_onlyStatus: '$t(errorPrefix) Status: {{status}}',
    responseError_withStatusText: '$t(errorPrefix) Status: {{status}} - {{statusText}}',
  },
};
/**
 * A reference type containing all currently used translation keys.
 * This type serves as a complete resource for creating custom translations,
 * ensuring that all required keys are present and included.
 * It can also be used as Partial to make sure custom translation does not contain any typos.
 *
 * @example
 * ```typescript
 * import { TranslationDictionary } from '@ethings-os/sdk-rest-client';
 *
 * const customTranslationResources: Partial<TranslationDictionary> = {
 * ```
 * @internal
 */
export type TranslationDictionary = typeof translation;
