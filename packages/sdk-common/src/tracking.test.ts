import { trackCliError, trackProductEvent, trackUiError } from './tracking';
import { HttpClient } from '@sisense/sdk-rest-client';

const fakeAction = 'fakeAction';
const fakeVersion = '0.0.0';

const expectedOptions = {
  cache: 'no-store',
  redirect: 'error',
  referrerPolicy: 'same-origin',
};

describe('tracking', () => {
  const postMock = vi.fn();
  const httpClient = { post: postMock } as unknown as HttpClient;

  beforeEach(() => {
    postMock.mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    postMock.mockClear();
  });

  it('trackProductEvent should send valid tracking object', async () => {
    const expectedPayload = {
      action: fakeAction,
      cat: 'composesdk',
      direct: true,
      eventType: 'product',
    };

    await trackProductEvent(fakeAction, {}, httpClient);
    expect(postMock).toHaveBeenCalledWith('api/activities/', [expectedPayload], expectedOptions);
  });

  describe('trackError', () => {
    const component = 'fakeComponent';
    const error = new Error('fakeError');

    const expectedPayload = {
      action: 'sdkError',
      cat: 'composesdk',
      direct: true,
      eventType: 'product',
      packageVersion: fakeVersion,
      component,
      error: error.message,
    };

    it('trackUiError should send valid tracking object', async () => {
      await trackUiError({ packageVersion: fakeVersion, component, error }, httpClient);
      expect(postMock).toHaveBeenCalledWith(
        'api/activities/',
        [{ ...expectedPayload, packageName: 'sdk-ui' }],
        expectedOptions,
      );
    });

    it('trackCliError should send valid tracking object', async () => {
      await trackCliError({ packageVersion: fakeVersion, component, error }, httpClient);
      expect(postMock).toHaveBeenCalledWith(
        'api/activities/',
        [{ ...expectedPayload, packageName: 'sdk-cli' }],
        expectedOptions,
      );
    });
  });
});
