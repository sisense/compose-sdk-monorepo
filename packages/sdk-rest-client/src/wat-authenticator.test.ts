import { TranslatableError } from './translation/translatable-error.js';
import { isWatAuthenticator, WatAuthenticator } from './wat-authenticator.js';

describe('WatAuthenticator', () => {
  const fakeDeploymentUrl = 'https://10.0.0.1';
  const fakeWat = 'wat';
  const fakeSessionToken = 'sessionToken';
  const fakeInitialiser = 'initialiser';

  let auth: WatAuthenticator;

  const fetchSpy = vi.fn();
  global.fetch = fetchSpy;

  beforeEach(() => {
    auth = new WatAuthenticator(fakeDeploymentUrl, fakeWat);
  });

  afterEach(() => {
    fetchSpy.mockClear();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const mockAuthenticateSuccessfully = () => {
    const response = {
      ok: true,
      json: vi
        .fn()
        .mockResolvedValue({ webSessionToken: fakeSessionToken, initialiser: fakeInitialiser }),
    };
    fetchSpy.mockResolvedValueOnce(response as unknown as Response);

    return auth.authenticate();
  };

  it('auth should be valid upon creation', () => {
    expect(auth.isValid()).toBe(true);
  });

  it('should invalidate auth', () => {
    auth.invalidate();
    expect(auth.isValid()).toBe(false);
  });

  it('should apply authorization and initialiser headers', async () => {
    await mockAuthenticateSuccessfully();
    const headers: HeadersInit = {};
    auth.applyHeader(headers);
    expect(headers).toStrictEqual({ Authorization: 'sessionToken', Initialiser: 'initialiser' });
  });

  it('should authenticate successfully and return true', async () => {
    const result = await mockAuthenticateSuccessfully();

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${fakeDeploymentUrl}/api/v1/wat/sessionToken`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: `{"webAccessToken": "${fakeWat}"}`,
    });
    expect(auth.isAuthenticating()).toBe(false);
  });

  // while this test exists, it will never happen when WatAuthenticator
  // is used in HttpClient because the interceptor will intercept and throw an error,
  // rather than allowing the 401 response to go through.
  it('should return false when authentication fails with 401 error', async () => {
    const response = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    };
    fetchSpy.mockResolvedValueOnce(response as unknown as Response);

    const result = await auth.authenticate();

    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  // this test is more realistic because when authentication fails,
  // the interceptor will throw an error
  it('should throw an error when authentication call throws an error', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Error returned by interceptor'));
    await expect(auth.authenticate()).rejects.toThrow(TranslatableError);
  });

  it('should run type guard correctly', () => {
    expect(isWatAuthenticator(auth)).toBe(true);
  });
});
