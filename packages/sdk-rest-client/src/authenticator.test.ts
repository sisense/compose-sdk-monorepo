/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getAuthenticator } from './authenticator';
import { PasswordAuthenticator } from './password-authenticator';
import { BearerAuthenticator } from './bearer-authenticator';
import { WatAuthenticator } from './wat-authenticator';
import { SsoAuthenticator } from './sso-authenticator';
describe('getAuthenticator', () => {
  const fakeUsername = 'username';
  const fakePassword = 'password';
  const fakeDeploymentUrl = '10.0.0.1';
  const fakeToken = 'token';
  const fakeWat = 'wat';

  it('should return PasswordAuthenticator', () => {
    const authenticator = getAuthenticator(
      fakeDeploymentUrl,
      fakeUsername,
      fakePassword,
      undefined,
      undefined,
      undefined,
    );
    expect(authenticator).toBeInstanceOf(PasswordAuthenticator);
  });

  it('should return BearerAuthenticator', () => {
    const authenticator = getAuthenticator(
      fakeDeploymentUrl,
      undefined,
      undefined,
      fakeToken,
      undefined,
      undefined,
    );
    expect(authenticator).toBeInstanceOf(BearerAuthenticator);
  });

  it('should return WatAuthenticator', () => {
    const authenticator = getAuthenticator(
      fakeDeploymentUrl,
      undefined,
      undefined,
      undefined,
      fakeWat,
      undefined,
    );
    expect(authenticator).toBeInstanceOf(WatAuthenticator);
  });

  it('should return SsoAuthenticator', () => {
    const authenticator = getAuthenticator(
      fakeDeploymentUrl,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
    expect(authenticator).toBeInstanceOf(SsoAuthenticator);
  });

  it('should return null', () => {
    const authenticator = getAuthenticator(
      fakeDeploymentUrl,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    expect(authenticator).toBeNull();
  });
});
