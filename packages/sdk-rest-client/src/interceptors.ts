import { Authenticator } from './interfaces.js';
import { isBearerAuthenticator } from './bearer-authenticator.js';
import { isWatAuthenticator } from './wat-authenticator.js';
import { isPasswordAuthenticator } from './password-authenticator.js';
import { isSsoAuthenticator } from './sso-authenticator.js';
import { TranslatableError } from './translation/translatable-error.js';

async function handleErrorResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    const contentType = response.headers?.get('Content-Type');
    const data =
      contentType && contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : {};
    throw new TranslatableError('errors.responseError', {
      status: response.status.toString(),
      statusText: response.statusText,
      errorCode: data.error?.code,
      errorMessage: data.error?.message,
      context: response.statusText ? 'withStatusText' : 'onlyStatus',
    });
  }
  return response;
}

function handleUnauthorizedResponse(response: Response, auth: Authenticator): Response {
  auth.invalidate();
  // skip login redirect for token auth
  if (isPasswordAuthenticator(auth)) {
    throw new TranslatableError('errors.passwordAuthFailed');
  }
  if (isBearerAuthenticator(auth) || isWatAuthenticator(auth)) {
    throw new TranslatableError('errors.tokenAuthFailed');
  }

  if (isSsoAuthenticator(auth) && !auth.isAuthenticating()) {
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
function isNetworkError(responseError: Error): boolean {
  return !!(responseError.message === 'Failed to fetch' && responseError.name === 'TypeError');
}

/**
 * Handles a Network error.
 *
 * @returns A promise that rejects with an error message.
 */
function handleNetworkError(): Promise<never> {
  console.warn(
    `Network error. Verify server is accessible and your domain is added to 'CORS Allowed Origins' in Sisense Admin Panel -> Security Settings.`,
  );
  return Promise.reject(new TranslatableError('errors.networkError'));
}

export const getResponseInterceptor = (auth: Authenticator) => async (response: Response) => {
  if (response.status === 401) {
    return handleUnauthorizedResponse(response, auth);
  }
  if (!response.ok) {
    return handleErrorResponse(response);
  }
  return response;
};

export const errorInterceptor = (error: Error) => {
  if (isNetworkError(error)) {
    return handleNetworkError();
  }
  return Promise.reject(error);
};
