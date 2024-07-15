/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { isSsoAuthenticator, SsoAuthenticator } from './sso-authenticator.js';

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
    const fakeLoginUrl = 'http://login.url';

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

    expect(window.location.href).toBe(`${fakeLoginUrl}?return_to=${fakeDeploymentUrl}`);
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

  it('should run type guard correctly', () => {
    expect(isSsoAuthenticator(auth)).toBe(true);
  });
});
