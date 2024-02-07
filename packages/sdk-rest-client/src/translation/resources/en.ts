/**
 * Translation dictionary for English language.
 */
export const translation = {
  errorPrefix: '[request-error]',
  errors: {
    networkError:
      "Network error. Probably you forgot to add your domain to 'CORS Allowed Origins' in Sisense Admin Panel -> Security Settings.",
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

export type TranslationDictionary = typeof translation;
