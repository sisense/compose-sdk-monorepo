import { BearerAuthenticator } from './bearer-authenticator.js';
import { errorInterceptor, getResponseInterceptor } from './interceptors.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { TranslatableError } from './translation/translatable-error.js';
import { WatAuthenticator } from './wat-authenticator.js';

const fakeDeploymentUrl = 'https://10.0.0.1';

describe('interceptors', () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should notify user about failed password authentication', async () => {
    const response = {
      status: 401,
    } as Response;

    const auth = new PasswordAuthenticator(fakeDeploymentUrl, 'user', 'pass');

    await expect(async () => {
      await getResponseInterceptor(auth)(response);
    }).rejects.toThrow();
  });

  it('should notify user about failed API token authentication', async () => {
    const response = {
      status: 401,
    } as Response;

    const auth = new BearerAuthenticator(fakeDeploymentUrl, 'token');
    await expect(async () => {
      await getResponseInterceptor(auth)(response);
    }).rejects.toThrow();
  });

  it('should notify user about failed WAT authentication', async () => {
    const response = {
      status: 401,
    } as Response;

    const auth = new WatAuthenticator(fakeDeploymentUrl, 'wat');

    await expect(async () => {
      await getResponseInterceptor(auth)(response);
    }).rejects.toThrow();
  });

  it('should redirect to login page for SSO authentication', async () => {
    const response = {
      status: 401,
    } as Response;

    const fakeLoginUrl = 'http://login.url';

    global.window = {
      location: {
        href: fakeDeploymentUrl,
        replace: (url) => {
          global.window.location.href = url.toString();
        },
      } as Location,
    } as Window & typeof globalThis;

    const auth = new SsoAuthenticator(fakeDeploymentUrl);

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

    await getResponseInterceptor(auth)(response);

    // flush promises
    await new Promise((resolve) => setImmediate(resolve));

    expect(window.location.href).toBe(
      `${fakeLoginUrl}?return_to=${encodeURIComponent(fakeDeploymentUrl)}`,
    );
  });

  it('should throw an error on failed response', async () => {
    const response = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as Response;

    const auth = new BearerAuthenticator(fakeDeploymentUrl, 'token');
    await expect(async () => {
      await getResponseInterceptor(auth)(response);
    }).rejects.toThrow(TranslatableError);
  });

  it('should pass response through on success', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
    } as Response;

    const auth = new BearerAuthenticator(fakeDeploymentUrl, 'token');
    const result = await getResponseInterceptor(auth)(response);
    expect(result).toEqual(response);
  });

  it('should throw translated error for network error', async () => {
    const responseError = new TypeError('Failed to fetch');
    await expect(errorInterceptor(responseError)).rejects.toThrow(/Network error/);
  });

  it('should reject with original error message for custom errors', async () => {
    const responseError = new Error('Custom error message');
    await expect(errorInterceptor(responseError)).rejects.toThrow(responseError);
  });
});
