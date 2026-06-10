/** @vitest-environment jsdom */
import { trackProductEvent } from '@sisense/sdk-tracking';
import { renderHook } from '@testing-library/react';

import { TrackingContextProvider } from '@/infra/decorators/component-decorators/with-tracking/use-track-component-init';

import { MockedSisenseContextProvider } from '../../../__test-helpers__';
import { useTrackWidgetInit } from './use-track-widget-init';

vi.mock('@sisense/sdk-tracking');
vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

const flushPromises = () => new Promise(setImmediate);

describe('useTrackWidgetInit', () => {
  beforeEach(() => {
    vi.mocked(trackProductEvent).mockReset();
    vi.mocked(trackProductEvent).mockResolvedValue(undefined);
  });

  it('fires sdkWidgetInit once with the full payload', async () => {
    const { rerender } = renderHook(
      () =>
        useTrackWidgetInit({
          widgetType: 'chart',
          widgetName: 'line',
          widgetTitle: 'Revenue',
          entityId: 'w-1',
        }),
      { wrapper: MockedSisenseContextProvider },
    );

    await flushPromises();

    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      'sdkWidgetInit',
      {
        widgetType: 'chart',
        widgetName: 'line',
        widgetTitle: 'Revenue',
        entityId: 'w-1',
        entityType: 'widget',
        eventType: 'action',
        featureName: 'composesdk',
        packageName: 'sdk-ui',
        packageVersion: 'unit-test-version',
        authType: undefined,
      },
      expect.anything(),
      false,
    );

    vi.mocked(trackProductEvent).mockClear();
    rerender();
    expect(trackProductEvent).not.toHaveBeenCalled();
  });

  it('fires even when nested inside TrackingContextProvider (skip-nested ignored)', async () => {
    renderHook(
      () =>
        useTrackWidgetInit({
          widgetType: 'pivot',
          widgetName: 'pivot',
          widgetTitle: null,
          entityId: 'w-3',
        }),
      {
        wrapper: ({ children }) => (
          <MockedSisenseContextProvider>
            <TrackingContextProvider>{children}</TrackingContextProvider>
          </MockedSisenseContextProvider>
        ),
      },
    );

    await flushPromises();

    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      'sdkWidgetInit',
      expect.objectContaining({ widgetType: 'pivot', widgetName: 'pivot', entityId: 'w-3' }),
      expect.anything(),
      false,
    );
  });

  it('passes isDebugMode=true when tracking is disabled', async () => {
    renderHook(
      () =>
        useTrackWidgetInit({
          widgetType: 'text',
          widgetName: 'text',
          widgetTitle: null,
          entityId: 'hashed-text-id',
        }),
      {
        wrapper: ({ children }) => (
          <MockedSisenseContextProvider tracking={{ enabled: false }}>
            {children}
          </MockedSisenseContextProvider>
        ),
      },
    );

    await flushPromises();

    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      'sdkWidgetInit',
      expect.objectContaining({
        widgetType: 'text',
        widgetName: 'text',
        widgetTitle: null,
        entityId: 'hashed-text-id',
      }),
      expect.anything(),
      true,
    );
  });

  it('suppresses the event when enabled is false', async () => {
    renderHook(
      () =>
        useTrackWidgetInit({
          widgetType: 'chart',
          widgetName: 'line',
          widgetTitle: null,
          entityId: 'w-disabled',
          enabled: false,
        }),
      { wrapper: MockedSisenseContextProvider },
    );

    await flushPromises();

    expect(trackProductEvent).not.toHaveBeenCalled();
  });

  it('does not fire twice when a dep changes while the trackEvent promise is still pending', async () => {
    // Simulate the network call hanging — the dispatcher never resolves.
    vi.mocked(trackProductEvent).mockReturnValue(new Promise<undefined>(() => {}));

    const { rerender } = renderHook(
      ({ widgetTitle }: { widgetTitle: string | null }) =>
        useTrackWidgetInit({
          widgetType: 'chart',
          widgetName: 'line',
          widgetTitle,
          entityId: 'w-pending',
        }),
      { wrapper: MockedSisenseContextProvider, initialProps: { widgetTitle: 'Title A' } },
    );

    await flushPromises();
    expect(trackProductEvent).toHaveBeenCalledTimes(1);

    // Change a dep before the in-flight promise resolves — the effect re-runs but
    // must NOT dispatch a second call (atomic guard-and-set via hasTrackedRef).
    rerender({ widgetTitle: 'Title B' });
    await flushPromises();
    expect(trackProductEvent).toHaveBeenCalledTimes(1);
  });

  it('fires exactly once when enabled flips from false to true', async () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) =>
        useTrackWidgetInit({
          widgetType: 'chart',
          widgetName: 'line',
          widgetTitle: null,
          entityId: 'w-5',
          enabled,
        }),
      { wrapper: MockedSisenseContextProvider, initialProps: { enabled: false } },
    );

    await flushPromises();
    expect(trackProductEvent).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await flushPromises();
    expect(trackProductEvent).toHaveBeenCalledTimes(1);

    rerender({ enabled: true });
    await flushPromises();
    expect(trackProductEvent).toHaveBeenCalledTimes(1);
  });

  it('uses the framework packageName from SisenseContext', async () => {
    renderHook(
      () =>
        useTrackWidgetInit({
          widgetType: 'custom',
          widgetName: 'my-plugin',
          widgetTitle: null,
          entityId: 'w-4',
        }),
      {
        wrapper: ({ children }) => (
          <MockedSisenseContextProvider tracking={{ packageName: 'sdk-ui-angular' }}>
            {children}
          </MockedSisenseContextProvider>
        ),
      },
    );

    await flushPromises();

    expect(trackProductEvent).toHaveBeenCalledWith(
      'sdkWidgetInit',
      expect.objectContaining({
        packageName: 'sdk-ui-angular',
        widgetType: 'custom',
        widgetName: 'my-plugin',
      }),
      expect.anything(),
      false,
    );
  });
});
