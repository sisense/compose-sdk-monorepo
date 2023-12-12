import { FetchInterceptorResponse } from 'fetch-intercept';
import {
  handleNetworkError,
  handleErrorResponse,
  handleUnauthorizedResponse,
  isNetworkError,
} from './interceptors.js';
import { PasswordAuthenticator } from './password-authenticator.js';
import { BearerAuthenticator } from './bearer-authenticator.js';
import { WatAuthenticator } from './wat-authenticator.js';
import { SsoAuthenticator } from './sso-authenticator.js';
import { TranslatableError } from './translation/translatable-error.js';

const fakeDeploymentUrl = 'https://10.0.0.1';

describe('Auth interceptor', () => {
  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should notify user about failed password authentication', () => {
    const response = {
      status: 401,
    } as FetchInterceptorResponse;

    const auth = new PasswordAuthenticator(fakeDeploymentUrl, 'user', 'pass');

    expect(() => handleUnauthorizedResponse(response, auth)).toThrow();
  });

  it('should notify user about failed API token authentication', () => {
    const response = {
      status: 401,
    } as FetchInterceptorResponse;

    const auth = new BearerAuthenticator(fakeDeploymentUrl, 'token');
    expect(() => handleUnauthorizedResponse(response, auth)).toThrow();
  });

  it('should notify user about failed WAT authentication', () => {
    const response = {
      status: 401,
    } as FetchInterceptorResponse;

    const auth = new WatAuthenticator(fakeDeploymentUrl, 'wat');

    expect(() => handleUnauthorizedResponse(response, auth)).toThrow();
  });

  it('should redirect to login page for SSO authentication', async () => {
    const response = {
      status: 401,
    } as FetchInterceptorResponse;

    const fakeLoginUrl = 'http://login.url';

    global.window = {
      location: { href: fakeDeploymentUrl } as Location,
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

    handleUnauthorizedResponse(response, auth);

    // flush promises
    await new Promise((resolve) => setImmediate(resolve));

    expect(window.location.href).toBe(`${fakeLoginUrl}?return_to=${fakeDeploymentUrl}`);
  });
});

describe('Error interceptor', () => {
  it('should throw an error on failed response', () => {
    const response = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as FetchInterceptorResponse;

    expect(() => handleErrorResponse(response)).toThrow(TranslatableError);
  });

  it('should pass response through on success', () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
    } as FetchInterceptorResponse;

    const result = handleErrorResponse(response);
    expect(result).toEqual(response);
  });
});

describe('Network error', () => {
  describe('isNetworkError', () => {
    it('should return true for Network error', () => {
      const responseError = new TypeError('Failed to fetch');
      expect(isNetworkError(responseError)).toBeTruthy();
    });
  });
  describe('handleNetworkError', () => {
    it("should reject with an error message constains 'Network error'", () => {
      return expect(handleNetworkError()).rejects.toThrow(/Network error/);
    });
  });
});
