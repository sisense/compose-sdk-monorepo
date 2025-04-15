/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  FusionAuthenticator,
  FusionWindow,
  isFusionAuthenticator,
} from './fusion-authenticator.js';

describe('FusionAuthenticator', () => {
  let auth: FusionAuthenticator;

  beforeEach(() => {
    auth = new FusionAuthenticator();
  });

  it('auth should be valid upon creation', () => {
    expect(auth.isValid()).toBe(true);
  });

  it('should invalidate auth', () => {
    auth.invalidate();
    expect(auth.isValid()).toBe(false);
  });

  it('should authenticate successfully and return true', async () => {
    global.window = {
      prism: {
        user: {
          _id: '123',
        },
      },
      document: {},
    } as FusionWindow;

    await auth.authenticate();
    const isAthenticated = await auth.authenticated();

    // flush promises
    await new Promise((resolve) => setImmediate(resolve));

    expect(isAthenticated).toBe(true);
  });

  it('should not authenticate if user is not authenticated', async () => {
    global.window = {} as FusionWindow;

    await auth.authenticate();
    const isAthenticated = await auth.authenticated();

    // flush promises
    await new Promise((resolve) => setImmediate(resolve));

    expect(isAthenticated).toBe(false);
  });

  it('should append csrf header', async () => {
    global.window = {
      prism: {
        user: {
          _id: '123',
        },
      },
      document: {},
    } as FusionWindow;

    const fakeCsrfToken = '33d57fe8-bce4-4019-96a4-a81a9e0dd625';

    Object.defineProperty(global.window.document, 'cookie', {
      writable: true,
      value: `28608c3c;XSRF-TOKEN=${fakeCsrfToken};b3864bb8cc4a`,
    });

    await auth.authenticate();

    const headers = {};

    auth.applyHeader(headers);
    // flush promises
    await new Promise((resolve) => setImmediate(resolve));

    expect(headers).toStrictEqual({ 'X-Xsrf-Token': fakeCsrfToken });
  });

  it('should run type guard correctly', () => {
    expect(isFusionAuthenticator(auth)).toBe(true);
  });
});
