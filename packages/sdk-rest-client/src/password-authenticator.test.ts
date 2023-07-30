/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PasswordAuthenticator } from './password-authenticator';

describe('PasswordAuthenticator', () => {
  const fakeDeploymentUrl = 'https://10.0.0.1';
  const fakeUsername = 'user';
  const fakePassword = 'pass';

  let auth: PasswordAuthenticator;

  beforeEach(() => {
    auth = new PasswordAuthenticator(fakeDeploymentUrl, fakeUsername, fakePassword);
  });

  afterAll(() => {
    jest.restoreAllMocks();
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
      json: jest.fn().mockResolvedValue({ access_token: fakeToken }),
    };

    global.fetch = jest.fn().mockImplementation(() => {
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

  it('should throw an error and return false when authentication fails', async () => {
    const response = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    };

    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({ json: () => response });
    });

    const result = await auth.authenticate();

    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
