/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BearerAuthenticator } from './bearer-authenticator.js';

describe('BearerAuthenticator', () => {
  const fakeDeploymentUrl = '10.0.0.1';
  const fakeToken = 'token';

  let auth: BearerAuthenticator;

  beforeEach(() => {
    auth = new BearerAuthenticator(fakeDeploymentUrl, fakeToken);
  });

  it('auth should be valid upon creation', () => {
    expect(auth.isValid()).toBe(true);
  });

  it('should invalidate auth', () => {
    auth.invalidate();
    expect(auth.isValid()).toBe(false);
  });

  it('should authenticate successfully and return true', async () => {
    const result = await auth.authenticate();

    expect(auth.bearer).toBe(fakeToken);
    expect(result).toBe(true);
  });
});
