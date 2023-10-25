import { getAuthenticator } from './authenticator.js';
import { HttpClient } from './http-client.js';
import { Authenticator } from './interfaces.js';

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    // You can use a mock Authenticator for testing purposes
    const auth: Authenticator = getAuthenticator(
      'https://example.com/',
      undefined,
      undefined,
      'test-token',
      undefined,
      false,
    )!;
    httpClient = new HttpClient('https://example.com/', auth, 'test');
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
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'response data' }),
      });

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
        ok: true,
        status: 200,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input')),
      });

      const response = await httpClient.call(httpClient.url + '/endpoint', {});
      expect(response).toBeUndefined();
    });
  });
});
