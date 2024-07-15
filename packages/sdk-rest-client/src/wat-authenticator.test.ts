/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

  it('should throw an error and return false when authentication fails', async () => {
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

  it('should run type guard correctly', () => {
    expect(isWatAuthenticator(auth)).toBe(true);
  });
});
