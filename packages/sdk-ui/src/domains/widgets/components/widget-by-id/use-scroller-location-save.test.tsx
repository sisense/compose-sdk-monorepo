import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useScrollerLocationSave } from './use-scroller-location-save';

const { patchWidgetInDashboard } = vi.hoisted(() => ({
  patchWidgetInDashboard: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/infra/api/rest-api', () => ({
  useRestApi: () => ({
    restApi: {
      patchWidgetInDashboard,
    },
    isReady: true,
  }),
}));

describe('useScrollerLocationSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    patchWidgetInDashboard.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces patchWidgetInDashboard calls', () => {
    const { result } = renderHook(() => useScrollerLocationSave('dash-1', 'w-a'));

    act(() => {
      result.current(0, 1);
      result.current(2, 3);
    });

    expect(patchWidgetInDashboard).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(patchWidgetInDashboard).toHaveBeenCalledTimes(1);
    expect(patchWidgetInDashboard).toHaveBeenCalledWith('dash-1', 'w-a', {
      options: { previousScrollerLocation: { min: 2, max: 3 } },
    });
  });

  it('merges currentOptions into the patch so other option fields are preserved', () => {
    const currentOptions = {
      dashboardFiltersMode: 'select' as const,
      selector: true,
      triggersDomready: true,
      autoUpdateOnEveryChange: true,
      drillToAnywhere: true,
    };
    const { result } = renderHook(() => useScrollerLocationSave('dash-1', 'w-a', currentOptions));

    act(() => {
      result.current(10, 90);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(patchWidgetInDashboard).toHaveBeenCalledWith('dash-1', 'w-a', {
      options: {
        ...currentOptions,
        previousScrollerLocation: { min: 10, max: 90 },
      },
    });
  });

  it('cancels pending save on unmount', () => {
    const { result, unmount } = renderHook(() => useScrollerLocationSave('dash-1', 'w-a'));

    act(() => {
      result.current(5, 95);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(patchWidgetInDashboard).not.toHaveBeenCalled();
  });
});
