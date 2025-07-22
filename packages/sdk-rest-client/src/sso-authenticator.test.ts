/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { normalizeUrl } from '@sisense/sdk-common';

import { isSsoAuthenticator, SsoAuthenticator } from './sso-authenticator.js';

const mockFetch = (loginUrl: string) =>
  vi.fn().mockImplementation(() => {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          isAuthenticated: false,
          ssoEnabled: true,
          loginUrl: loginUrl,
        }),
    } as Response);
  });

describe('SSOAuthenticator', () => {
  const fakeDeploymentUrl = 'https://random.awesome-app.com/cool-path/';

  let auth: SsoAuthenticator;

  beforeEach(() => {
    auth = new SsoAuthenticator(fakeDeploymentUrl);
  });

  it('auth should be valid upon creation', () => {
    expect(auth.isValid()).toBe(true);
  });

  it('should invalidate auth', () => {
    auth.invalidate();
    expect(auth.isValid()).toBe(false);
  });

  it('should authenticate successfully and return true', async () => {
    const fakeLoginUrl = normalizeUrl('http://login.url');

    global.window = {
      location: {
        href: fakeDeploymentUrl,
        replace: (url) => {
          global.window.location.href = url.toString();
        },
      } as Location,
    } as Window & typeof globalThis;

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            isAuthenticated: false,
            ssoEnabled: true,
            loginUrl: fakeLoginUrl,
          }),
      } as Response);
    });

    await auth.authenticate();

    // flush promises
    await new Promise((resolve) => setImmediate(resolve));

    expect(window.location.href).toBe(
      `${fakeLoginUrl}?return_to=${encodeURIComponent(fakeDeploymentUrl)}`,
    );
  });

  it('should throw an error if sso is not enabled on the instance', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            isAuthenticated: false,
            ssoEnabled: false,
          }),
      } as Response);
    });

    await expect(auth.authenticate()).rejects.toThrow(
      'SSO is not enabled on target instance, please choose another authentication method',
    );
  });

  it('should throw an error on receiving non json response from server', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(
        new Response('some html', {
          headers: new Headers({
            'Content-Type': 'text/html',
          }),
        }),
      );
    });

    await expect(auth.authenticate()).rejects.toThrow('Failed to authenticate.');
  });

  it('should run type guard correctly', () => {
    expect(isSsoAuthenticator(auth)).toBe(true);
  });

  describe('Should construct URLs correctly', () => {
    beforeEach(() => {
      global.window = {
        location: {
          href: fakeDeploymentUrl,
          replace: (url) => {
            global.window.location.href = url.toString();
          },
        } as Location,
      } as Window & typeof globalThis;
    });

    it('if login URL is relative', async () => {
      const fakeLoginUrl = '/users/login';
      global.fetch = mockFetch(fakeLoginUrl);

      await auth.authenticate();

      // flush promises
      await new Promise((resolve) => setImmediate(resolve));

      expect(window.location.href).toBe(
        `${fakeDeploymentUrl}users/login/?return_to=${encodeURIComponent(fakeDeploymentUrl)}`,
      );
    });

    it('if login URL is relative with no forward slash', async () => {
      const fakeLoginUrl = 'users/login';
      global.fetch = mockFetch(fakeLoginUrl);

      await auth.authenticate();

      // flush promises
      await new Promise((resolve) => setImmediate(resolve));

      expect(window.location.href).toBe(
        `${fakeDeploymentUrl}users/login/?return_to=${encodeURIComponent(fakeDeploymentUrl)}`,
      );
    });

    it('if alternative sso host is provided and login URL is relative', async () => {
      const fakeLoginUrl = '/users/login';
      const fakeSsoHost = 'http://sso.app.client.com/login';
      global.fetch = mockFetch(fakeLoginUrl);

      const authenticator = new SsoAuthenticator(fakeDeploymentUrl, false, fakeSsoHost);

      await authenticator.authenticate();

      // flush promises
      await new Promise((resolve) => setImmediate(resolve));

      expect(window.location.href).toBe(
        `${fakeSsoHost}${fakeLoginUrl}/?return_to=${encodeURIComponent(fakeDeploymentUrl)}`,
      );
    });
    it('if query parameters have to be merged', async () => {
      const fakeLoginUrl = '/users/login?tracking=true&role=view';
      const fakeSsoHost = 'http://sso.app.client.com/auth?app=staging';
      global.fetch = mockFetch(fakeLoginUrl);

      const authenticator = new SsoAuthenticator(fakeDeploymentUrl, false, fakeSsoHost);

      await authenticator.authenticate();

      // flush promises
      await new Promise((resolve) => setImmediate(resolve));

      const testUrl = new URL(window.location.href);

      expect(testUrl.origin).toBe('http://sso.app.client.com');
      expect(testUrl.pathname).toBe('/auth/users/login/');
      expect(testUrl.searchParams.toString().includes('tracking')).toBeTruthy();
      expect(testUrl.searchParams.toString().includes('role')).toBeTruthy();
      expect(testUrl.searchParams.toString().includes('app')).toBeTruthy();
      expect(testUrl.searchParams.toString().includes('return_to')).toBeTruthy();
    });
  });
});
