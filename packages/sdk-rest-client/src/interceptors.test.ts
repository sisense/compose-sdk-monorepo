import { normalizeUrl } from '@sisense/sdk-common';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { BearerAuthenticator } from './bearer-authenticator.js';
import type { HttpErrorEvent, HttpRequestContext } from './http-error-event.js';
import { getErrorInterceptor, getResponseInterceptor } from './interceptors.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { TranslatableError } from './translation/translatable-error.js';
import { WatAuthenticator } from './wat-authenticator.js';

const fakeDeploymentUrl = 'https://10.0.0.1';
const requestUrl = `${fakeDeploymentUrl}/api/v1/things`;

const createContext = (): HttpRequestContext & { onError: ReturnType<typeof vi.fn> } => ({
  url: requestUrl,
  method: 'POST',
  onError: vi.fn(),
});

const lastEvent = (context: { onError: ReturnType<typeof vi.fn> }): HttpErrorEvent =>
  context.onError.mock.calls[0][0] as HttpErrorEvent;

describe('interceptors', () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('401', () => {
    const response = new Response(null, { status: 401 });

    it('throws and emits "unauthorized" for password authentication', async () => {
      const auth = new PasswordAuthenticator(fakeDeploymentUrl, 'user', 'pass');
      const context = createContext();

      await expect(getResponseInterceptor(auth, context)(response)).rejects.toThrow(
        TranslatableError,
      );
      expect(context.onError).toHaveBeenCalledTimes(1);
      expect(lastEvent(context)).toMatchObject({
        kind: 'unauthorized',
        status: 401,
        url: requestUrl,
        method: 'POST',
        authType: 'password',
      });
      expect(lastEvent(context).error.message).toMatch(/Username and password/);
    });

    it('throws and emits "unauthorized" for API token authentication', async () => {
      const auth = new BearerAuthenticator(fakeDeploymentUrl, 'token');
      const context = createContext();

      await expect(getResponseInterceptor(auth, context)(response)).rejects.toThrow(
        TranslatableError,
      );
      expect(lastEvent(context)).toMatchObject({ kind: 'unauthorized', authType: 'bearer' });
    });

    it('throws and emits "unauthorized" for WAT authentication', async () => {
      const auth = new WatAuthenticator(fakeDeploymentUrl, 'wat');
      const context = createContext();

      await expect(getResponseInterceptor(auth, context)(response)).rejects.toThrow(
        TranslatableError,
      );
      expect(lastEvent(context)).toMatchObject({ kind: 'unauthorized', authType: 'wat' });
    });

    it('emits "unauthorized", re-authenticates and returns the response for SSO', async () => {
      const fakeLoginUrl = normalizeUrl('http://login.url');

      vi.stubGlobal('window', {
        location: {
          href: fakeDeploymentUrl,
          replace: (url: string | URL) => {
            window.location.href = url.toString();
          },
        },
      });

      const auth = new SsoAuthenticator(fakeDeploymentUrl);
      const context = createContext();

      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() =>
          Promise.resolve(
            new Response(
              JSON.stringify({
                isAuthenticated: false,
                ssoEnabled: true,
                loginUrl: fakeLoginUrl,
              }),
              { headers: { 'Content-Type': 'application/json' } },
            ),
          ),
        ),
      );

      const result = await getResponseInterceptor(auth, context)(response);
      expect(result).toBe(response);
      expect(lastEvent(context)).toMatchObject({ kind: 'unauthorized', authType: 'sso' });
      expect(lastEvent(context).error.message).toMatch(/Session has expired/);

      // flush promises
      await new Promise((resolve) => setImmediate(resolve));

      expect(window.location.href).toBe(
        `${fakeLoginUrl}?return_to=${encodeURIComponent(fakeDeploymentUrl)}`,
      );
    });
  });

  describe('non-OK responses', () => {
    const auth = new BearerAuthenticator(fakeDeploymentUrl, 'token');

    it('throws a forbidden error and emits "forbidden" for 403', async () => {
      const response = new Response(null, { status: 403, statusText: 'Forbidden' });
      const context = createContext();

      await expect(getResponseInterceptor(auth, context)(response)).rejects.toThrow(
        /Access denied \(403\)/,
      );
      expect(lastEvent(context)).toMatchObject({ kind: 'forbidden', status: 403 });
    });

    it('throws a translated response error and emits "server" for 5xx', async () => {
      const response = new Response(null, { status: 502, statusText: 'Bad Gateway' });
      const context = createContext();

      await expect(getResponseInterceptor(auth, context)(response)).rejects.toThrow(
        /Request failed with status 502 Bad Gateway/,
      );
      expect(lastEvent(context)).toMatchObject({ kind: 'server', status: 502 });
    });

    it('throws a translated response error and emits "client" for other 4xx', async () => {
      const response = new Response(null, { status: 400, statusText: '' });
      const context = createContext();

      await expect(getResponseInterceptor(auth, context)(response)).rejects.toThrow(
        /Request failed with status 400\./,
      );
      expect(lastEvent(context)).toMatchObject({ kind: 'client', status: 400 });
    });

    it('exposes status on the thrown error', async () => {
      const response = new Response(null, { status: 404, statusText: 'Not Found' });
      await expect(getResponseInterceptor(auth, createContext())(response)).rejects.toMatchObject({
        status: '404',
      });
    });

    it('rejects with the translated error and emits "server" when the JSON body is null', async () => {
      const response = new Response('null', {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' },
      });
      const context = createContext();

      await expect(getResponseInterceptor(auth, context)(response)).rejects.toThrow(
        /Request failed with status 500/,
      );
      expect(lastEvent(context)).toMatchObject({ kind: 'server', status: 500 });
    });

    it('passes the response through on success without emitting', async () => {
      const response = new Response(null, { status: 200, statusText: 'OK' });
      const context = createContext();
      const result = await getResponseInterceptor(auth, context)(response);
      expect(result).toEqual(response);
      expect(context.onError).not.toHaveBeenCalled();
    });

    it('works without an onError listener', async () => {
      const response = new Response(null, { status: 500, statusText: 'Oops' });
      await expect(
        getResponseInterceptor(auth, { url: requestUrl, method: 'GET' })(response),
      ).rejects.toThrow(TranslatableError);
    });
  });

  describe('getErrorInterceptor', () => {
    const auth = new BearerAuthenticator(fakeDeploymentUrl, 'token');

    it('throws a translated network error and emits "network"', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const context = createContext();
      const responseError = new TypeError('Failed to fetch');

      await expect(getErrorInterceptor(auth, context)(responseError)).rejects.toThrow(
        /Network error/,
      );
      expect(lastEvent(context)).toMatchObject({ kind: 'network', authType: 'bearer' });
      expect(lastEvent(context).status).toBeUndefined();
      warn.mockRestore();
    });

    it('rejects with the original error and does not emit for custom errors', async () => {
      const context = createContext();
      const responseError = new Error('Custom error message');
      await expect(getErrorInterceptor(auth, context)(responseError)).rejects.toThrow(
        responseError,
      );
      expect(context.onError).not.toHaveBeenCalled();
    });
  });
});
