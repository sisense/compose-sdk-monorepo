/* eslint-disable promise/param-names */
/* eslint-disable @typescript-eslint/no-throw-literal */
/// <reference lib="dom" />
import { Authenticator } from './interfaces.js';
import fetchIntercept from 'fetch-intercept';
import { getResponseInterceptor, errorInterceptor } from './interceptors.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { addQueryParamsToUrl } from './helpers.js';

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
    if (!url.endsWith('/')) {
      url += '/';
    }

    this.url = url;
    this.auth = auth;
    this.env = env;

    fetchIntercept.register({
      response: getResponseInterceptor(auth),
      responseError: errorInterceptor,
    });
  }

  async login(): Promise<boolean> {
    return this.auth.authenticate();
  }

  async call<T = unknown>(
    url: string,
    config: RequestInit,
    requestConfig?: HttpClientRequestConfig,
  ): Promise<T> {
    if (this.auth.isAuthenticating()) {
      return new Promise((res) => {
        const retry = () => {
          // wait if still authenticating
          if (this.auth.isAuthenticating()) {
            setTimeout(retry, 10);
            return;
          }

          void this.call(url, config, requestConfig).then((r) => res(r as T));
        };

        retry();
      });
    }

    config.headers = config.headers || {};

    if (this.auth instanceof SsoAuthenticator) {
      // allows cookies to be sent
      config.credentials = 'include';
    }

    this.auth.applyHeader(config.headers);

    // used for API usage tracking
    const trackedUrl = addQueryParamsToUrl(url, {
      trc: this.env,
    });

    const response = await fetch(requestConfig?.skipTrackingParam ? url : trackedUrl, config);
    if (
      response.status === 204 || // No content
      response.status === 304 // Not modified
    ) {
      return undefined as T;
    }
    try {
      return (requestConfig?.returnBlob ? await response.blob() : await response.json()) as T;
    } catch (e) {
      // some of APIs in Sisense returns 200 with empty body - so it's not possible
      // to understand definitely is it empty or not until you will try to parse it
      if (e instanceof Error && e.message.includes('Unexpected end of JSON input')) {
        return undefined as T;
      } else {
        throw e;
      }
    }
  }

  // eslint-disable-next-line max-params
  async post<T = unknown>(
    endpoint: string,
    data: unknown,
    options: RequestInit = {},
    abortSignal?: AbortSignal,
    config?: HttpClientRequestConfig,
  ): Promise<T> {
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

  async get<T = unknown>(
    endpoint: string,
    request: RequestInit = {},
    config?: HttpClientRequestConfig,
  ): Promise<T> {
    request.method = 'GET';

    return this.call<T>(this.url + endpoint, request, config);
  }

  async delete<T = void>(
    endpoint: string,
    request: RequestInit = {},
    config?: HttpClientRequestConfig,
  ): Promise<T> {
    request.method = 'DELETE';

    return this.call<T>(this.url + endpoint, request, config);
  }
}
