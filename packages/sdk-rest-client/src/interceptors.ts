import { isBearerAuthenticator } from './bearer-authenticator.js';
import { asHttpErrorKind, emitHttpError, type HttpRequestContext } from './http-error-event.js';
import { Authenticator } from './interfaces.js';
import { isPasswordAuthenticator } from './password-authenticator.js';
import { isSsoAuthenticator } from './sso-authenticator.js';
import { TranslatableError } from './translation/translatable-error.js';
import { isWatAuthenticator } from './wat-authenticator.js';

/**
 * Shape of the JSON error body Sisense servers may return alongside a non-OK response.
 * @internal
 */
type ErrorResponseBody = { error?: { code?: string; message?: string } } | null;

async function handleErrorResponse(
  response: Response,
  auth: Authenticator,
  context: HttpRequestContext,
): Promise<Response> {
  if (!response.ok) {
    const contentType = response.headers?.get('Content-Type');
    const data: ErrorResponseBody =
      contentType && contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : null;
    const kind = asHttpErrorKind(response.status);
    const interpolation = {
      status: response.status.toString(),
      statusText: response.statusText,
      errorCode: data?.error?.code ?? '',
      errorMessage: data?.error?.message ?? '',
      context: response.statusText ? 'withStatusText' : 'onlyStatus',
    };
    const error =
      kind === 'forbidden'
        ? new TranslatableError('errors.forbidden', interpolation)
        : new TranslatableError('errors.responseError', interpolation);

    emitHttpError(context, {
      kind,
      status: response.status,
      url: context.url,
      method: context.method,
      authType: auth.type,
      error,
    });
    throw error;
  }
  return response;
}

function asUnauthorizedError(auth: Authenticator): TranslatableError {
  if (isPasswordAuthenticator(auth)) {
    return new TranslatableError('errors.passwordAuthFailed');
  }
  if (isBearerAuthenticator(auth) || isWatAuthenticator(auth)) {
    return new TranslatableError('errors.tokenAuthFailed');
  }
  return new TranslatableError('errors.sessionExpired');
}

function handleUnauthorizedResponse(
  response: Response,
  auth: Authenticator,
  context: HttpRequestContext,
): Response {
  auth.invalidate();
  const error = asUnauthorizedError(auth);

  emitHttpError(context, {
    kind: 'unauthorized',
    status: 401,
    url: context.url,
    method: context.method,
    authType: auth.type,
    error,
  });

  // skip login redirect for token auth
  if (isPasswordAuthenticator(auth) || isBearerAuthenticator(auth) || isWatAuthenticator(auth)) {
    throw error;
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
 * @param responseError - The error object received from the failed response
 */
function isNetworkError(responseError: Error): boolean {
  return !!(responseError.message === 'Failed to fetch' && responseError.name === 'TypeError');
}

/**
 * Handles a Network error.
 * @returns A promise that rejects with the translated network error.
 */
function handleNetworkError(error: TranslatableError): Promise<never> {
  console.warn(
    `Network error. Verify server is accessible and your domain is added to 'CORS Allowed Origins' in Sisense Admin Panel -> Security Settings.`,
  );
  return Promise.reject(error);
}

/**
 * Creates the response interceptor for one request: classifies failures, emits `onError`, then
 * throws (or, for SSO 401, returns the response after triggering re-authentication).
 * @param auth - Authenticator used for the request, consulted to classify and handle 401s
 * @param context - Per-request context carrying the URL, method and optional `onError` listener
 * @returns A function that takes the raw `fetch` response and resolves to the response to use,
 * or rejects with a {@link TranslatableError}.
 * @internal
 */
export const getResponseInterceptor =
  (auth: Authenticator, context: HttpRequestContext) => async (response: Response) => {
    if (response.status === 401) {
      return handleUnauthorizedResponse(response, auth, context);
    }
    if (!response.ok) {
      return handleErrorResponse(response, auth, context);
    }
    return response;
  };

/**
 * Creates the fetch-rejection interceptor for one request: translates network failures and emits `onError`.
 * @param auth - Authenticator used for the request, included in the emitted error event
 * @param context - Per-request context carrying the URL, method and optional `onError` listener
 * @returns A function that takes the `fetch` rejection error and rejects with the translated
 * error (or the original error when it is not a recognized network failure).
 * @internal
 */
export const getErrorInterceptor =
  (auth: Authenticator, context: HttpRequestContext) => (error: Error) => {
    if (isNetworkError(error)) {
      const translatableError = new TranslatableError('errors.networkError');
      emitHttpError(context, {
        kind: 'network',
        url: context.url,
        method: context.method,
        authType: auth.type,
        error: translatableError,
      });
      return handleNetworkError(translatableError);
    }
    return Promise.reject(error);
  };
