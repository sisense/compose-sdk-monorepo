/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { SsoAuthenticator } from './sso-authenticator.js';

describe('SSOAuthenticator', () => {
  const fakeDeploymentUrl = '10.0.0.1';

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
    const result = await auth.authenticate();

    expect(result).toBe(true);
  });
});
