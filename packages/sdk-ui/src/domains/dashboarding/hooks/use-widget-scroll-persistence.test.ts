import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DashboardPersistenceManager } from '@/domains/dashboarding/persistence/types';

import { useWidgetScrollPersistence } from './use-widget-scroll-persistence';

function makePersistence(): DashboardPersistenceManager {
  return {
    addWidget: vi.fn(),
    patchWidget: vi.fn().mockResolvedValue(undefined),
  };
}

describe('useWidgetScrollPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the same debounced handler for the same widget OID', () => {
    const persistence = makePersistence();
    const { result } = renderHook(() => useWidgetScrollPersistence(persistence));
    const a = result.current('w-a');
    const b = result.current('w-a');
    expect(a).toBe(b);
  });

  it('returns different handlers for different widget OIDs', () => {
    const persistence = makePersistence();
    const { result } = renderHook(() => useWidgetScrollPersistence(persistence));
    const a = result.current('w-a');
    const b = result.current('w-b');
    expect(a).not.toBe(b);
  });

  it('debounces patchWidget calls for the same widget', () => {
    const persistence = makePersistence();
    const { result } = renderHook(() => useWidgetScrollPersistence(persistence));

    act(() => {
      result.current('w-a')(0, 1);
      result.current('w-a')(2, 3);
    });

    expect(persistence.patchWidget).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.patchWidget).toHaveBeenCalledTimes(1);
    expect(persistence.patchWidget).toHaveBeenCalledWith('w-a', {
      options: { previousScrollerLocation: { min: 2, max: 3 } },
    });
  });

  it('merges widgetsOptions into the patch so other option fields are preserved', () => {
    const persistence = makePersistence();
    const options = {
      dashboardFiltersMode: 'select' as const,
      selector: true,
      triggersDomready: true,
    };
    const widgetsOptions = { 'w-a': { partialDtoOptions: { options } } };
    const { result } = renderHook(() => useWidgetScrollPersistence(persistence, widgetsOptions));

    act(() => {
      result.current('w-a')(5, 95);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.patchWidget).toHaveBeenCalledWith('w-a', {
      options: { ...options, previousScrollerLocation: { min: 5, max: 95 } },
    });
  });

  it('calls patchWidget independently per widget', () => {
    const persistence = makePersistence();
    const { result } = renderHook(() => useWidgetScrollPersistence(persistence));

    act(() => {
      result.current('w-a')(0, 50);
      result.current('w-b')(10, 90);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.patchWidget).toHaveBeenCalledTimes(2);
    expect(persistence.patchWidget).toHaveBeenCalledWith('w-a', {
      options: { previousScrollerLocation: { min: 0, max: 50 } },
    });
    expect(persistence.patchWidget).toHaveBeenCalledWith('w-b', {
      options: { previousScrollerLocation: { min: 10, max: 90 } },
    });
  });

  it('cancels all pending debouncers on unmount', () => {
    const persistence = makePersistence();
    const { result, unmount } = renderHook(() => useWidgetScrollPersistence(persistence));

    act(() => {
      result.current('w-a')(5, 95);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.patchWidget).not.toHaveBeenCalled();
  });

  it('returns a no-op handler when persistence is undefined', () => {
    const { result } = renderHook(() => useWidgetScrollPersistence(undefined));

    act(() => {
      result.current('w-a')(0, 100);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // No errors thrown — the factory returns a no-op when persistence is absent.
  });
});
