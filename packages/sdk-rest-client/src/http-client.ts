/// <reference lib="dom" />
import { normalizeUrl } from '@sisense/sdk-common';

import { isFusionAuthenticator } from './fusion-authenticator.js';
import { addQueryParamsToUrl, appendHeaders, validateUrl } from './helpers.js';
import type { HttpClientOptions, HttpRequestContext } from './http-error-event.js';
import { getErrorInterceptor, getResponseInterceptor } from './interceptors.js';
import { Authenticator } from './interfaces.js';
import { isSsoAuthenticator } from './sso-authenticator.js';

export interface HttpClientRequestConfig {
  skipTrackingParam?: boolean;
  nonJSONBody?: boolean;
  returnBlob?: boolean;
  /** Suppresses the `onError` notification hook for this request. The error still throws. */
  skipErrorNotification?: boolean;
}

export class HttpClient {
  readonly auth: Authenticator;

  readonly url: string;

  readonly env: string;

  readonly customHeaders: Record<string, string>;

  /** Holds the optional behavior configured for this client, such as the `onError` listener. */
  readonly options: HttpClientOptions;

  /**
   * Creates an `HttpClient`.
   * @param url - Base URL of the Sisense instance
   * @param auth - Authenticator used to authenticate and sign requests
   * @param env - Environment identifier sent as the `trc` tracking query param
   * @param customHeaders - Extra headers appended to every request. Defaults to none
   * @param options - Optional behavior for this client, such as the `onError` listener
   */
  // eslint-disable-next-line max-params
  constructor(
    url: string,
    auth: Authenticator,
    env: string,
    customHeaders: Record<string, string> = {},
    options: HttpClientOptions = {},
  ) {
    this.url = normalizeUrl(url);
    this.auth = auth;
    this.env = env;
    this.customHeaders = customHeaders;
    this.options = options;
  }

  login() {
    return this.auth.authenticate();
  }

  async call<T>(
    url: string,
    config: RequestInit,
    requestConfig?: HttpClientRequestConfig,
  ): Promise<T | undefined> {
    if (this.auth.isAuthenticating()) {
      await this.auth.authenticated();
    }

    config.headers = config.headers || {};

    if (isSsoAuthenticator(this.auth) || isFusionAuthenticator(this.auth)) {
      // allows cookies to be sent — required for SSO session cookies and for
      // FusionAuth so the Fusion session cookie is included alongside the
      // X-Xsrf-Token header (without it the server rejects the request with 401).
      config.credentials = 'include';
    }

    this.auth.applyHeaders(config.headers);
    appendHeaders(config.headers, this.customHeaders);

    const fetchUrl = requestConfig?.skipTrackingParam
      ? url
      : addQueryParamsToUrl(url, {
          trc: this.env,
        });

    validateUrl(fetchUrl, this.url);

    const context: HttpRequestContext = {
      url: fetchUrl,
      method: config.method ?? 'GET',
      onError: requestConfig?.skipErrorNotification ? undefined : this.options.onError,
    };

    const response = await fetch(fetchUrl, config)
      .then(getResponseInterceptor(this.auth, context))
      .catch(getErrorInterceptor(this.auth, context));
    if (
      response.status === 204 || // No content
      response.status === 304 // Not modified
    ) {
      return;
    }

    return (
      requestConfig?.returnBlob
        ? response.blob()
        : response.json().catch((e) => {
            // some of APIs in Sisense returns 200 with empty body - so it's not possible
            // to understand definitely is it empty or not until you will try to parse it
            if (!e?.message?.includes?.('Unexpected end of JSON input')) {
              throw e;
            }
          })
    ) as T;
  }

  // eslint-disable-next-line max-params
  post<T = unknown>(
    endpoint: string,
    data: unknown,
    options: RequestInit = {},
    abortSignal?: AbortSignal,
    config?: HttpClientRequestConfig,
  ): Promise<T | undefined> {
    const request = {
      method: 'POST',
      body: (config?.nonJSONBody ? data : JSON.stringify(data)) as BodyInit,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      signal: abortSignal,
      ...options,
    };

    return this.call<T>(this.url + endpoint, request, config);
  }

  patch<T = unknown>(
    endpoint: string,
    data: unknown,
    options: RequestInit = {},
    abortSignal?: AbortSignal,
    config?: HttpClientRequestConfig,
  ): Promise<T | undefined> {
    const request = {
      method: 'PATCH',
      body: (config?.nonJSONBody ? data : JSON.stringify(data)) as BodyInit,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      signal: abortSignal,
      ...options,
    };

    return this.call<T>(this.url + endpoint, request, config);
  }

  get<T = unknown>(
    endpoint: string,
    request: RequestInit = {},
    config?: HttpClientRequestConfig,
  ): Promise<T | undefined> {
    return this.call<T>(this.url + endpoint, { ...request, method: 'GET' }, config);
  }

  delete<T = void>(
    endpoint: string,
    request: RequestInit = {},
    config?: HttpClientRequestConfig,
  ): Promise<T | undefined> {
    return this.call<T>(this.url + endpoint, { ...request, method: 'DELETE' }, config);
  }
}
