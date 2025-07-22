/// <reference lib="dom" />
import { normalizeUrl } from '@sisense/sdk-common';

import { addQueryParamsToUrl } from './helpers.js';
import { errorInterceptor, getResponseInterceptor } from './interceptors.js';
import { Authenticator } from './interfaces.js';
import { isSsoAuthenticator } from './sso-authenticator.js';

export interface HttpClientRequestConfig {
  skipTrackingParam?: boolean;
  nonJSONBody?: boolean;
  returnBlob?: boolean;
}

export class HttpClient {
  readonly auth: Authenticator;

  readonly url: string;

  readonly env: string;

  constructor(url: string, auth: Authenticator, env: string) {
    this.url = normalizeUrl(url);
    this.auth = auth;
    this.env = env;
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

    if (isSsoAuthenticator(this.auth)) {
      // allows cookies to be sent
      config.credentials = 'include';
    }

    this.auth.applyHeaders(config.headers);

    const fetchUrl = requestConfig?.skipTrackingParam
      ? url
      : addQueryParamsToUrl(url, {
          trc: this.env,
        });

    const response = await fetch(fetchUrl, config)
      .then(getResponseInterceptor(this.auth))
      .catch(errorInterceptor);
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
