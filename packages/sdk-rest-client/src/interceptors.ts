import { FetchInterceptorResponse } from 'fetch-intercept';
import { BearerAuthenticator } from './bearer-authenticator.js';
import { WatAuthenticator } from './wat-authenticator.js';
import { Authenticator } from './interfaces.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { TranslatableError } from './translation/translatable-error.js';

export function handleErrorResponse(response: FetchInterceptorResponse): FetchInterceptorResponse {
  if (!response.ok) {
    throw new TranslatableError('errors.responseError', {
      status: response.status.toString(),
      statusText: response.statusText,
      context: response.statusText ? 'withStatusText' : 'onlyStatus',
    });
  }
  return response;
}

export function handleUnauthorizedResponse(
  response: FetchInterceptorResponse,
  auth: Authenticator,
): FetchInterceptorResponse {
  auth.invalidate();
  // skip login redirect for token auth
  if (auth instanceof PasswordAuthenticator) {
    throw new TranslatableError('errors.passwordAuthFailed');
  }
  if (auth instanceof BearerAuthenticator || auth instanceof WatAuthenticator) {
    throw new TranslatableError('errors.tokenAuthFailed');
  }

  if (auth instanceof SsoAuthenticator && !auth.isAuthenticating()) {
    // try to reauthenticate
    void auth.authenticate();
  }
  return response;
}

/**
 * Checks if the given response error indicates a Network error.
 *
 * It is impossible to distinguish between a CORS error and other network errors, such as
 * 'net::ERR_SSL_PROTOCOL_ERROR' and 'net::ERR_EMPTY_RESPONSE'. This information is hidden by the browser.
 *
 * @param responseError - The error object received from the failed response.
 */
export function isNetworkError(responseError: Error): boolean {
  return !!(responseError.message === 'Failed to fetch' && responseError.name === 'TypeError');
}

/**
 * Handles a Network error.
 *
 * @returns A promise that rejects with an error message.
 */
export function handleNetworkError(): Promise<never> {
  return Promise.reject(new TranslatableError('errors.networkError'));
}
