import { getAuthenticator } from './authenticator.js';

describe('getAuthenticator', () => {
  const fakeUsername = 'username';
  const fakePassword = 'password';
  const fakeDeploymentUrl = 'https://10.0.0.1';
  const fakeToken = 'token';
  const fakeWat = 'wat';

  it('should return PasswordAuthenticator', () => {
    const authenticator = getAuthenticator({
      url: fakeDeploymentUrl,
      username: fakeUsername,
      password: fakePassword,
    });
    expect(authenticator?.type).toBe('password');
  });

  it('should return BearerAuthenticator', () => {
    const authenticator = getAuthenticator({
      url: fakeDeploymentUrl,
      token: fakeToken,
    });
    expect(authenticator?.type).toBe('bearer');
  });

  it('should return WatAuthenticator', () => {
    const authenticator = getAuthenticator({
      url: fakeDeploymentUrl,
      wat: fakeWat,
    });
    expect(authenticator?.type).toBe('wat');
  });

  it('should return SsoAuthenticator', () => {
    const authenticator = getAuthenticator({
      url: fakeDeploymentUrl,
      ssoEnabled: true,
    });
    expect(authenticator?.type).toBe('sso');
  });

  it('should return null', () => {
    const authenticator = getAuthenticator({
      url: fakeDeploymentUrl,
    });
    expect(authenticator).toBeNull();
  });
});
