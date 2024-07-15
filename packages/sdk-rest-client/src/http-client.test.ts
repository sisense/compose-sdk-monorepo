import fetchIntercept from 'fetch-intercept';
import { getAuthenticator } from './authenticator.js';
import { HttpClient } from './http-client.js';
import { errorInterceptor, getResponseInterceptor } from './interceptors.js';

const mockSuccessResponse = {
  ok: true,
  status: 200,
  json: () => Promise.resolve({ data: 'response data' }),
};

const mockResponseInterceptor = vi.fn();
vi.mock('./interceptors.js', () => ({
  getResponseInterceptor: vi.fn(() => mockResponseInterceptor),
  errorInterceptor: vi.fn(),
}));

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    // You can use a mock Authenticator for testing purposes
    const auth = getAuthenticator({
      url: 'https://example.com/',
      token: 'test-token',
    });
    if (auth) {
      httpClient = new HttpClient('https://example.com/', auth, 'test');
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created successfully', () => {
    expect(httpClient).toBeInstanceOf(HttpClient);
  });

  it('should have the correct properties', () => {
    expect(httpClient.url).toBe('https://example.com/');
    expect(httpClient.env).toBe('test');
  });

  it('should have the correct interceptors registered', () => {
    const fetchInterceptRegister = vi.spyOn(fetchIntercept, 'register');
    new HttpClient('https://example.com/', httpClient.auth, 'test');
    expect(getResponseInterceptor).toHaveBeenCalledWith(httpClient.auth);
    expect(fetchInterceptRegister).toHaveBeenCalledWith({
      response: mockResponseInterceptor,
      responseError: errorInterceptor,
    });
  });

  it('should call the authenticate method when logging in', async () => {
    const authenticateSpy = vi.spyOn(httpClient.auth, 'authenticate');
    await httpClient.login();
    expect(authenticateSpy).toHaveBeenCalled();
  });

  describe('call', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
    it('should handle successful API call', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockSuccessResponse);

      const response = await httpClient.call(httpClient.url + '/endpoint', {});
      expect(response).toEqual({ data: 'response data' });
    });

    it('should handle empty response with status 204', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      });

      const response = await httpClient.call(httpClient.url + '/endpoint', {});
      expect(response).toBeUndefined();
    });

    it('should handle empty response with status 304', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 304,
      });

      const response = await httpClient.call(httpClient.url + '/endpoint', {});
      expect(response).toBeUndefined();
    });

    it('should handle empty response with status 200', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ...mockSuccessResponse,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input')),
      });

      const response = await httpClient.call(httpClient.url + '/endpoint', {});
      expect(response).toBeUndefined();
    });

    it('should include credetials to request for sso authentication', async () => {
      const ssoAuth = getAuthenticator({
        url: 'https://example.com/',
        ssoEnabled: true,
      });
      expect(ssoAuth).not.toBeNull();
      if (!ssoAuth) {
        return;
      }

      const ssoHttpClient = new HttpClient('https://example.com/', ssoAuth, 'test');

      global.fetch = vi.fn().mockResolvedValue(mockSuccessResponse);

      await ssoHttpClient.call(ssoHttpClient.url + '/endpoint', {});
      expect(global.fetch).toHaveBeenCalledWith(expect.any(String), {
        headers: {},
        credentials: 'include',
      });
    });

    it('should add tracking param by default', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockSuccessResponse);

      await httpClient.call(httpClient.url + '/endpoint', {});
      expect(global.fetch).toHaveBeenCalledWith(
        httpClient.url + '/endpoint' + '?trc=test',
        expect.any(Object),
      );
    });

    it('should skip tracking if configured', async () => {
      global.fetch = vi.fn().mockResolvedValue(mockSuccessResponse);

      await httpClient.call(httpClient.url + '/endpoint', {}, { skipTrackingParam: true });
      expect(global.fetch).toHaveBeenCalledWith(httpClient.url + '/endpoint', expect.any(Object));
    });

    it('should handle blob response if configured', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        blob: () => new Blob(),
      });

      const response = await httpClient.call(
        httpClient.url + '/endpoint',
        {},
        { returnBlob: true },
      );
      expect(response).toBeInstanceOf(Blob);
    });

    it('should throw an error if response to json transformation fails', async () => {
      const error = new Error('Failed to parse JSON');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(error),
      });

      await expect(httpClient.call(httpClient.url + '/endpoint', {})).rejects.toThrow(error);
    });

    it('should throw an error if response to blob transformation fails', async () => {
      const error = new Error('Failed to create blob');
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        blob: vi.fn().mockRejectedValue(error),
      });

      await expect(
        httpClient.call(httpClient.url + '/endpoint', {}, { returnBlob: true }),
      ).rejects.toThrow(error);
    });
  });

  describe('post', () => {
    it('should call the call method with the correct parameters', async () => {
      const mockBody = { data: 'request data' };
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.post('/endpoint', mockBody, undefined);
      expect(callSpy).toHaveBeenCalledWith(
        httpClient.url + '/endpoint',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8',
          },
          body: JSON.stringify(mockBody),
          signal: undefined,
        },
        undefined,
      );
    });

    it('should not stringify data when nonJSONBody is true', async () => {
      const mockBody = { data: 'request data' };
      const requestConfig = { nonJSONBody: true };
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.post('/endpoint', mockBody, undefined, undefined, requestConfig);
      expect(callSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: mockBody,
        }),
        requestConfig,
      );
    });

    it('should pass the abort signal to the call method', async () => {
      const abortController = new AbortController();
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.post('/endpoint', {}, undefined, abortController.signal);
      expect(callSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: abortController.signal,
        }),
        undefined,
      );
    });

    it('should pass the request options to the call method', async () => {
      const requestOptions = { referrerPolicy: 'no-referrer' as const };
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.post('/endpoint', {}, requestOptions);
      expect(callSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(requestOptions),
        undefined,
      );
    });
  });

  describe('get', () => {
    it('should call the call method with the correct parameters', async () => {
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.get('/endpoint', undefined);
      expect(callSpy).toHaveBeenCalledWith(
        httpClient.url + '/endpoint',
        {
          method: 'GET',
        },
        undefined,
      );
    });

    it('should pass the request options to the call method', async () => {
      const requestOptions = { referrerPolicy: 'no-referrer' as const };
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.get('/endpoint', requestOptions);
      expect(callSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(requestOptions),
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('should call the call method with the correct parameters', async () => {
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.delete('/endpoint', undefined);
      expect(callSpy).toHaveBeenCalledWith(
        httpClient.url + '/endpoint',
        {
          method: 'DELETE',
        },
        undefined,
      );
    });

    it('should pass the request options to the call method', async () => {
      const requestOptions = { referrerPolicy: 'no-referrer' as const };
      const callSpy = vi.spyOn(httpClient, 'call').mockResolvedValue({});
      await httpClient.delete('/endpoint', requestOptions);
      expect(callSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(requestOptions),
        undefined,
      );
    });
  });
});
