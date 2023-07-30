import { FetchInterceptorResponse } from 'fetch-intercept';
import { BearerAuthenticator } from './bearer-authenticator.js';
import { WatAuthenticator } from './wat-authenticator.js';
import { Authenticator } from './interfaces.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { ERROR_PREFIX } from './constants.js';

interface IsAuthResponse {
  isAuthenticated: boolean;
  loginUrl: string;
}

export function handleErrorResponse(response: FetchInterceptorResponse): FetchInterceptorResponse {
  if (!response.ok) {
    throw Error(
      `${ERROR_PREFIX} Status: ${response.status}${
        response.statusText ? ' - ' + response.statusText : ''
      }`,
    );
  }
  return response;
}

export function handleUnauthorizedResponse(
  response: FetchInterceptorResponse,
  auth: Authenticator,
  url: string,
): FetchInterceptorResponse {
  auth.invalidate();
  // skip login redirect for token auth
  if (auth instanceof PasswordAuthenticator) {
    throw Error(
      `${ERROR_PREFIX} Username and password authentication was not successful. Check credentials or choose another method`,
    );
  }
  if (auth instanceof BearerAuthenticator || auth instanceof WatAuthenticator) {
    throw Error(
      `${ERROR_PREFIX} Token authentication was not successful. Check credentials or choose another method`,
    );
  }

  if (auth instanceof SsoAuthenticator) {
    // redirect to login page
    void fetch(`${url}api/auth/isauth`, {
      headers: { Internal: 'true' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res: IsAuthResponse) => {
        if (!res.isAuthenticated) {
          window.location.href = `${res.loginUrl}?return_to=${window.location.href}`;
        }
      });
  }
  return response;
}

/**
 * Checks if the given response error indicates a CORS error.
 *
 * @param responseError - The error object received from the failed response.
 */
export function isCorsError(responseError: Error & { request?: Request }): boolean {
  return !!(
    responseError.request &&
    responseError.request.mode === 'cors' &&
    responseError.request.credentials === 'same-origin' &&
    responseError.message === 'Failed to fetch' &&
    responseError.name === 'TypeError'
  );
}

/**
 * Handles a CORS error.
 *
 * @returns A promise that rejects with an error message.
 */
export function handleCorsError(): Promise<never> {
  return Promise.reject(
    new Error(
      "Cross-origin requests blocked. To enable, add your domain to 'CORS Allowed Origins' in Sisense Admin Panel -> Security Settings.",
    ),
  );
}
