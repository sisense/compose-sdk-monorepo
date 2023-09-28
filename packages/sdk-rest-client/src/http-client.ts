/* eslint-disable promise/param-names */
/* eslint-disable @typescript-eslint/no-throw-literal */
/// <reference lib="dom" />
import { Authenticator } from './interfaces.js';
import fetchIntercept from 'fetch-intercept';
import {
  handleNetworkError,
  handleErrorResponse,
  handleUnauthorizedResponse,
  isNetworkError,
} from './interceptors.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { addQueryParamsToUrl } from './helpers.js';

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
      response: (response) => {
        if (response.status === 401) {
          return handleUnauthorizedResponse(response, auth);
        }
        if (!response.ok) {
          return handleErrorResponse(response);
        }
        return response;
      },
      responseError: (error: Error) => {
        if (isNetworkError(error)) {
          return handleNetworkError();
        }
        return Promise.reject(error);
      },
    });
  }

  async login(): Promise<boolean> {
    return this.auth.authenticate();
  }

  async call(url: string, config: RequestInit): Promise<Response> {
    if (this.auth.isAuthenticating()) {
      return new Promise((res) => {
        const retry = () => {
          // wait if still authenticating
          if (this.auth.isAuthenticating()) {
            setTimeout(retry, 10);
            return;
          }

          void this.call(url, config).then((r) => res(r));
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

    return fetch(trackedUrl, config);
  }

  // eslint-disable-next-line max-params
  async post<T>(
    endpoint: string,
    data: unknown,
    options: RequestInit = {},
    abortSignal?: AbortSignal,
  ): Promise<T> {
    const request = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      signal: abortSignal,
      ...options,
    };

    const res = await this.call(this.url + endpoint, request);
    return res.json() as T;
  }

  async get<T>(endpoint: string, request: RequestInit = {}): Promise<T> {
    request.method = 'GET';

    const res = await this.call(this.url + endpoint, request);
    return res.json() as T;
  }

  async delete(endpoint: string, request: RequestInit = {}): Promise<Response> {
    request.method = 'DELETE';

    return this.call(this.url + endpoint, request);
  }
}
