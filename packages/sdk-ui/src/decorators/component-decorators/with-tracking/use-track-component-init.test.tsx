/** @vitest-environment jsdom */

import { trackProductEvent } from '@sisense/sdk-tracking';
import { renderHook } from '@testing-library/react';
import { TrackingContextProvider, useTrackComponentInit } from './use-track-component-init';
import { MockedSisenseContextProvider } from '../../../__test-helpers__';

vi.mock('@sisense/sdk-tracking');
vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

describe('useTrackComponentInit', () => {
  beforeEach(() => {
    vi.mocked(trackProductEvent).mockReset();
    vi.mocked(trackProductEvent).mockResolvedValue(undefined);
  });

  it('tracks the sdkComponentInit event once and only once', async () => {
    const { rerender } = renderHook(
      () => useTrackComponentInit('TestComponent', { prop1: 'value1', prop2: 'value2' }),
      {
        wrapper: MockedSisenseContextProvider,
      },
    );

    // Flush promises so hasTrackedRef.current is set after trackProductEvent() resolves
    // https://rickschubert.net/blog/posts/flushing-promises/#:~:text=How%20does%20flushing%20promises%20work
    await new Promise(setImmediate);

    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      'sdkComponentInit',
      {
        packageName: 'sdk-ui',
        packageVersion: 'unit-test-version',
        componentName: 'TestComponent',
        attributesUsed: 'prop1, prop2',
        authType: undefined,
      },
      expect.anything(),
      false,
    );

    vi.mocked(trackProductEvent).mockClear();

    rerender();

    expect(trackProductEvent).not.toHaveBeenCalled();
  });

  it('calls trackProductEvent with correct params when tracking is disabled in context provider', async () => {
    renderHook(() => useTrackComponentInit('TestComponent', { prop1: 'value1', prop2: 'value2' }), {
      wrapper: ({ children }) => (
        <MockedSisenseContextProvider tracking={{ enabled: false }}>
          {children}
        </MockedSisenseContextProvider>
      ),
    });

    // Flush promises so hasTrackedRef.current is set after trackProductEvent() resolves
    // https://rickschubert.net/blog/posts/flushing-promises/#:~:text=How%20does%20flushing%20promises%20work
    await new Promise(setImmediate);

    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      'sdkComponentInit',
      {
        packageName: 'sdk-ui',
        packageVersion: 'unit-test-version',
        componentName: 'TestComponent',
        attributesUsed: 'prop1, prop2',
        authType: undefined,
      },
      expect.anything(),
      true,
    );
  });

  it('does not track if already inside tracking context', () => {
    renderHook(() => useTrackComponentInit('TestComponent', { prop1: 'value1', prop2: 'value2' }), {
      wrapper: ({ children }) => (
        <MockedSisenseContextProvider>
          <TrackingContextProvider>{children}</TrackingContextProvider>
        </MockedSisenseContextProvider>
      ),
    });

    expect(trackProductEvent).not.toHaveBeenCalled();
  });
});
