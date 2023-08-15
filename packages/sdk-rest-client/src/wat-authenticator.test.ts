/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { WatAuthenticator } from './wat-authenticator.js';

describe('WatAuthenticator', () => {
  const fakeDeploymentUrl = 'https://10.0.0.1';
  const fakeWat = 'wat';
  const fakeSessionToken = 'sessionToken';
  const fakeInitialiser = 'initialiser';

  let auth: WatAuthenticator;

  beforeEach(() => {
    auth = new WatAuthenticator(fakeDeploymentUrl, fakeWat);
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

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(response);
    });

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

    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(response);
    });

    const result = await auth.authenticate();

    expect(result).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
