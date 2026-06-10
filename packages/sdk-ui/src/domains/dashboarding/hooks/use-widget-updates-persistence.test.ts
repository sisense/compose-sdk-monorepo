import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DashboardPersistenceManager } from '@/domains/dashboarding/persistence/types';

import { useWidgetUpdatesPersistence } from './use-widget-updates-persistence';

function makePersistence(): DashboardPersistenceManager {
  return {
    addWidget: vi.fn(),
    patchWidget: vi.fn().mockResolvedValue(undefined),
    updateWidget: vi.fn().mockResolvedValue(undefined),
  };
}

function makeWidget(id: string, navigatorEnabled = true) {
  return {
    id,
    widgetType: 'chart' as const,
    styleOptions: navigatorEnabled ? { navigator: { enabled: true } } : {},
  } as never;
}

function makeCustomWidget(
  id: string,
  customOptions: Record<string, unknown> = {},
  styleOptions: Record<string, unknown> = {},
) {
  return {
    id,
    widgetType: 'custom' as const,
    customWidgetType: 'my-plugin',
    dataOptions: {},
    customOptions,
    styleOptions,
  } as never;
}

describe('useWidgetUpdatesPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('injects onScrollerChange that emits a scrollerLocation update', () => {
    const persistence = makePersistence();
    const setWidgets = vi.fn();
    const widgets = [makeWidget('w-a')];

    const { result } = renderHook(() =>
      useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
    );
    const wiredNavigator = (
      result.current.widgets[0] as never as {
        styleOptions: { navigator: { onScrollerChange: (min: number, max: number) => void } };
      }
    ).styleOptions.navigator;
    expect(typeof wiredNavigator.onScrollerChange).toBe('function');

    act(() => {
      wiredNavigator.onScrollerChange(10, 90);
    });

    expect(setWidgets).toHaveBeenCalled();
    expect(persistence.updateWidget).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.updateWidget).toHaveBeenCalledWith('w-a', {
      styleOptions: { navigator: { scrollerLocation: { min: 10, max: 90 } } },
    });
  });

  it('coalesces with last-write-wins inside the debounce window', () => {
    const persistence = makePersistence();
    const setWidgets = vi.fn();
    const widgets = [makeWidget('w-a')];

    const { result } = renderHook(() =>
      useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
    );
    const nav = (
      result.current.widgets[0] as never as {
        styleOptions: { navigator: { onScrollerChange: (min: number, max: number) => void } };
      }
    ).styleOptions.navigator;

    act(() => {
      nav.onScrollerChange(0, 100);
      nav.onScrollerChange(20, 80);
      nav.onScrollerChange(30, 70);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.updateWidget).toHaveBeenCalledTimes(1);
    expect(persistence.updateWidget).toHaveBeenCalledWith('w-a', {
      styleOptions: { navigator: { scrollerLocation: { min: 30, max: 70 } } },
    });
  });

  it('debounces independently per widget', () => {
    const persistence = makePersistence();
    const setWidgets = vi.fn();
    const widgets = [makeWidget('w-a'), makeWidget('w-b')];

    const { result } = renderHook(() =>
      useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
    );
    const getNav = (index: number) =>
      (
        result.current.widgets[index] as never as {
          styleOptions: { navigator: { onScrollerChange: (min: number, max: number) => void } };
        }
      ).styleOptions.navigator;

    act(() => {
      getNav(0).onScrollerChange(0, 50);
      getNav(1).onScrollerChange(10, 90);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.updateWidget).toHaveBeenCalledTimes(2);
    expect(persistence.updateWidget).toHaveBeenCalledWith('w-a', {
      styleOptions: { navigator: { scrollerLocation: { min: 0, max: 50 } } },
    });
    expect(persistence.updateWidget).toHaveBeenCalledWith('w-b', {
      styleOptions: { navigator: { scrollerLocation: { min: 10, max: 90 } } },
    });
  });

  it('cancels pending debouncers on unmount', () => {
    const persistence = makePersistence();
    const setWidgets = vi.fn();
    const widgets = [makeWidget('w-a')];

    const { result, unmount } = renderHook(() =>
      useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
    );
    const nav = (
      result.current.widgets[0] as never as {
        styleOptions: { navigator: { onScrollerChange: (min: number, max: number) => void } };
      }
    ).styleOptions.navigator;

    act(() => {
      nav.onScrollerChange(5, 95);
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(persistence.updateWidget).not.toHaveBeenCalled();
  });

  it('still applies optimistic updates when persistence is undefined', () => {
    const setWidgets = vi.fn();
    const widgets = [makeWidget('w-a')];

    const { result } = renderHook(() =>
      useWidgetUpdatesPersistence(widgets, setWidgets, undefined),
    );

    act(() => {
      (
        result.current.widgets[0] as never as {
          styleOptions: { navigator: { onScrollerChange: (min: number, max: number) => void } };
        }
      ).styleOptions.navigator.onScrollerChange(5, 95);
    });

    expect(setWidgets).toHaveBeenCalled();
  });

  it('leaves widgets without a navigator unchanged', () => {
    const widgets = [makeWidget('w-a', false)];
    const setWidgets = vi.fn();

    const { result } = renderHook(() =>
      useWidgetUpdatesPersistence(widgets, setWidgets, makePersistence()),
    );

    expect(result.current.widgets[0]).toEqual(widgets[0]);
  });

  describe('custom widgets', () => {
    const getOnVisualizationUpdate = (widget: unknown) =>
      (widget as { onChange?: (update: unknown) => void }).onChange;

    it('injects onChange that emits a customOptions update', () => {
      const persistence = makePersistence();
      const setWidgets = vi.fn();
      const widgets = [makeCustomWidget('cw-a', { lastPage: 0 })];

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
      );

      const onChange = getOnVisualizationUpdate(result.current.widgets[0]);
      expect(typeof onChange).toBe('function');

      act(() => {
        onChange!({ customOptions: { lastPage: 3 } });
      });

      expect(setWidgets).toHaveBeenCalled();
      expect(persistence.updateWidget).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(persistence.updateWidget).toHaveBeenCalledWith('cw-a', {
        customOptions: { lastPage: 3 },
      });
    });

    it('injects onChange that emits a styleOptions update', () => {
      const persistence = makePersistence();
      const setWidgets = vi.fn();
      const widgets = [makeCustomWidget('cw-a')];

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
      );

      act(() => {
        getOnVisualizationUpdate(result.current.widgets[0])!({
          styleOptions: { rowsPerPage: 20 },
        });
      });

      expect(setWidgets).toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(persistence.updateWidget).toHaveBeenCalledWith('cw-a', {
        styleOptions: { rowsPerPage: 20 },
      });
    });

    it('merges styleOptions and customOptions emitted within the same debounce window', () => {
      const persistence = makePersistence();
      const setWidgets = vi.fn();
      const widgets = [makeCustomWidget('cw-a')];

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
      );

      // Emulates a plugin handler changing both fields in one tick (e.g. selecting
      // rows-per-page resets the page) — neither update must be dropped.
      act(() => {
        const onChange = getOnVisualizationUpdate(result.current.widgets[0])!;
        onChange({ styleOptions: { rowsPerPage: 20 } });
        onChange({ customOptions: { lastOpenedPage: 0 } });
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(persistence.updateWidget).toHaveBeenCalledTimes(1);
      expect(persistence.updateWidget).toHaveBeenCalledWith('cw-a', {
        styleOptions: { rowsPerPage: 20 },
        customOptions: { lastOpenedPage: 0 },
      });
    });

    it('does not emit when the update is empty', () => {
      const persistence = makePersistence();
      const setWidgets = vi.fn();
      const widgets = [makeCustomWidget('cw-a')];

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
      );

      act(() => {
        getOnVisualizationUpdate(result.current.widgets[0])!({});
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(setWidgets).not.toHaveBeenCalled();
      expect(persistence.updateWidget).not.toHaveBeenCalled();
    });

    it('optimistically merges customOptions into the existing bag', () => {
      let stored = [makeCustomWidget('cw-a', { lastPage: 0, theme: 'dark' })];
      const setWidgets = (updater: (prev: never[]) => never[]) => {
        stored = updater(stored as never) as never;
      };

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(stored, setWidgets as never, makePersistence()),
      );

      act(() => {
        getOnVisualizationUpdate(result.current.widgets[0])!({ customOptions: { lastPage: 5 } });
      });

      expect((stored[0] as { customOptions: unknown }).customOptions).toEqual({
        lastPage: 5,
        theme: 'dark',
      });
    });

    it('optimistically deep-merges a nested styleOptions update, preserving sibling keys', () => {
      // Oleg's pagination example: a plugin emits only the leaf that changed —
      // sibling keys of the same nested object must survive.
      let stored = [
        makeCustomWidget('cw-a', {}, { pagination: { currentPage: 1, location: 'left' } }),
      ];
      const setWidgets = (updater: (prev: never[]) => never[]) => {
        stored = updater(stored as never) as never;
      };

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(stored, setWidgets as never, makePersistence()),
      );

      act(() => {
        getOnVisualizationUpdate(result.current.widgets[0])!({
          styleOptions: { pagination: { currentPage: 3 } },
        });
      });

      expect((stored[0] as { styleOptions: unknown }).styleOptions).toEqual({
        pagination: { currentPage: 3, location: 'left' },
      });
    });

    it('optimistically deep-merges a nested customOptions update, preserving sibling keys', () => {
      let stored = [makeCustomWidget('cw-a', { view: { zoom: 1, center: 'auto' }, theme: 'dark' })];
      const setWidgets = (updater: (prev: never[]) => never[]) => {
        stored = updater(stored as never) as never;
      };

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(stored, setWidgets as never, makePersistence()),
      );

      act(() => {
        getOnVisualizationUpdate(result.current.widgets[0])!({
          customOptions: { view: { zoom: 2 } },
        });
      });

      expect((stored[0] as { customOptions: unknown }).customOptions).toEqual({
        view: { zoom: 2, center: 'auto' },
        theme: 'dark',
      });
    });

    it('deep-merges nested updates emitted within the same debounce window before persisting', () => {
      const persistence = makePersistence();
      const setWidgets = vi.fn();
      const widgets = [makeCustomWidget('cw-a')];

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(widgets, setWidgets, persistence),
      );

      // Two updates touching different leaves of the same nested object —
      // neither leaf must be dropped by the accumulator.
      act(() => {
        const onChange = getOnVisualizationUpdate(result.current.widgets[0])!;
        onChange({ styleOptions: { pagination: { currentPage: 3 } } });
        onChange({ styleOptions: { pagination: { rowsPerPage: 20 } } });
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(persistence.updateWidget).toHaveBeenCalledTimes(1);
      expect(persistence.updateWidget).toHaveBeenCalledWith('cw-a', {
        styleOptions: { pagination: { currentPage: 3, rowsPerPage: 20 } },
      });
    });

    it('replaces arrays wholesale instead of merging them', () => {
      let stored = [makeCustomWidget('cw-a', { selectedIds: [1, 2, 3] })];
      const setWidgets = (updater: (prev: never[]) => never[]) => {
        stored = updater(stored as never) as never;
      };

      const { result } = renderHook(() =>
        useWidgetUpdatesPersistence(stored, setWidgets as never, makePersistence()),
      );

      act(() => {
        getOnVisualizationUpdate(result.current.widgets[0])!({
          customOptions: { selectedIds: [4] },
        });
      });

      expect((stored[0] as { customOptions: unknown }).customOptions).toEqual({
        selectedIds: [4],
      });
    });
  });
});
