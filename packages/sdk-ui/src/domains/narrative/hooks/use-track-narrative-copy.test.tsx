/** @vitest-environment jsdom */
import { trackProductEvent } from '@sisense/sdk-tracking';
import { renderHook } from '@testing-library/react';

import { MockedSisenseContextProvider } from '../../../__test-helpers__';
import { useTrackNarrativeCopy } from './use-track-narrative-copy';

vi.mock('@sisense/sdk-tracking');

const flushPromises = () => new Promise(setImmediate);

describe('useTrackNarrativeCopy', () => {
  beforeEach(() => {
    vi.mocked(trackProductEvent).mockReset();
    vi.mocked(trackProductEvent).mockResolvedValue(undefined);
  });

  it('sends nothing until the callback is invoked', async () => {
    renderHook(() => useTrackNarrativeCopy({ dashboardId: 'd-1', widgetEntityId: 'w-1' }), {
      wrapper: MockedSisenseContextProvider,
    });

    await flushPromises();

    expect(trackProductEvent).not.toHaveBeenCalled();
  });

  it('reports a copy against the saved dashboard', async () => {
    const { result } = renderHook(
      () => useTrackNarrativeCopy({ dashboardId: 'd-1', widgetEntityId: 'w-1' }),
      { wrapper: MockedSisenseContextProvider },
    );

    result.current();
    await flushPromises();

    expect(trackProductEvent).toHaveBeenCalledTimes(1);
    expect(trackProductEvent).toHaveBeenCalledWith(
      'copyDashboardNarrative',
      {
        cat: 'air',
        featureName: 'dashboardNarratives',
        eventType: 'userAction',
        entityType: 'dashboard',
        entityId: 'd-1',
        clickButton: 'true',
        authType: 'bearer',
      },
      expect.anything(),
      false,
    );
  });

  it('falls back to the widget as the entity without a dashboard id', async () => {
    const { result } = renderHook(() => useTrackNarrativeCopy({ widgetEntityId: 'w-1' }), {
      wrapper: MockedSisenseContextProvider,
    });

    result.current();
    await flushPromises();

    expect(trackProductEvent).toHaveBeenCalledWith(
      'copyDashboardNarrative',
      expect.objectContaining({ entityType: 'widget', entityId: 'w-1' }),
      expect.anything(),
      false,
    );
  });

  it('passes isDebugMode=true when tracking is disabled', async () => {
    const { result } = renderHook(
      () => useTrackNarrativeCopy({ dashboardId: 'd-1', widgetEntityId: 'w-1' }),
      {
        wrapper: ({ children }) => (
          <MockedSisenseContextProvider tracking={{ enabled: false }}>
            {children}
          </MockedSisenseContextProvider>
        ),
      },
    );

    result.current();
    await flushPromises();

    expect(trackProductEvent).toHaveBeenCalledWith(
      'copyDashboardNarrative',
      expect.objectContaining({ entityId: 'd-1' }),
      expect.anything(),
      true,
    );
  });
});
