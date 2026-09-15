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
    ssoNoLoginUrl: 'Unable to fetch SSO login URL from target instance. Check SSO settings.',
    passwordAuthFailed:
      '$t(errorPrefix) Username and password authentication was not successful. Check credentials.',
    tokenAuthFailed: '$t(errorPrefix) Token authentication was not successful. Check credentials.',
    authRedirectLimitExceeded:
      'SSO redirect limit reached. Authentication may be blocked by browser privacy settings or third-party cookie restrictions. Please check your SSO configuration or try a different browser.',
    sessionExpired: '$t(errorPrefix) Session has expired. Re-authentication is required.',
    forbidden:
      '$t(errorPrefix) Access denied ({{status}}). You do not have permission to perform this request.',
    responseError: '$t(errorPrefix) Request failed with status {{status}}.',
    responseError_onlyStatus: '$t(errorPrefix) Request failed with status {{status}}.',
    responseError_withStatusText:
      '$t(errorPrefix) Request failed with status {{status}} {{statusText}}.',
  },
};
/**
 * A reference type containing all currently used translation keys.
 * This type serves as a complete resource for creating custom translations,
 * ensuring that all required keys are present and included.
 * It can also be used as Partial to make sure custom translation does not contain any typos.
 * @example
 * ```typescript
 * import { TranslationDictionary } from '@sisense/sdk-rest-client';
 *
 * const customTranslationResources: Partial<TranslationDictionary> = {
 * ```
 * @internal
 */
export type TranslationDictionary = typeof translation;
