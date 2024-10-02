import { isPasswordAuthenticator, PasswordAuthenticator } from './password-authenticator.js';

describe('PasswordAuthenticator', () => {
  const fakeDeploymentUrl = 'https://10.0.0.1';
  const fakeUsername = 'user';
  const fakePassword = 'pass';

  let auth: PasswordAuthenticator;

  beforeEach(() => {
    auth = new PasswordAuthenticator(fakeDeploymentUrl, fakeUsername, fakePassword);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('auth should be valid upon creation', () => {
    expect(auth.isValid()).toBe(true);
  });

  it('should invalidate auth', () => {
    auth.invalidate();
    expect(auth.isValid()).toBe(false);
  });

  it('should authenticate successfully and return true', async () => {
    const fakeToken = 'token';
    const response = {
      ok: true,
      json: vi.fn().mockResolvedValue({ access_token: fakeToken }),
    };

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(response);
    });

    const result = await auth.authenticate();

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${fakeDeploymentUrl}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `username=${encodeURIComponent(fakeUsername)}&password=${encodeURIComponent(
        fakePassword,
      )}`,
    });
    expect(auth.isAuthenticating()).toBe(false);
  });

  // while this test exists, it will never happen when PasswordAuthenticator
  // is used in HttpClient because the interceptor will intercept and throw an error,
  // rather than allowing the 401 response to go through.
  it('should return false when authentication fails', async () => {
    const response = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    };

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({ json: () => response });
    });

    const result = await auth.authenticate();

    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // this test is more realistic because when authentication fails,
  // the interceptor will throw an error
  it('should throw an error when authentication call throws an error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Error returned by interceptor'));
    await expect(auth.authenticate()).rejects.toThrow(Error);
  });

  it('should run type guard correctly', () => {
    expect(isPasswordAuthenticator(auth)).toBe(true);
  });
});
