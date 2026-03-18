import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetChangeEvent } from '@/domains/widgets/change-events.js';
import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';

import { useWidgetRenaming, type UseWidgetRenamingParams } from './use-widget-renaming.js';

function getWidgetOnChange(widget: WidgetProps): ((event: WidgetChangeEvent) => void) | undefined {
  return 'onChange' in widget && typeof widget.onChange === 'function'
    ? (widget.onChange as (event: WidgetChangeEvent) => void)
    : undefined;
}

const createMinimalWidget = (overrides?: Partial<WidgetProps>): WidgetProps =>
  ({
    id: 'widget-1',
    widgetType: 'chart',
    dataOptions: {},
    ...overrides,
  } as WidgetProps);

describe('useWidgetRenaming', () => {
  it('returns widgets unchanged when enabled is false', () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const params: UseWidgetRenamingParams = {
      widgets,
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    expect(result.current.widgets).toEqual(widgets);
    expect(result.current.widgets[0]?.config?.header?.title?.editing?.enabled).toBeUndefined();
  });

  it('returns widgets with config.header.title.editing.enabled when enabled is true', () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    expect(result.current.widgets).toHaveLength(1);
    expect(result.current.widgets[0]?.config?.header?.title?.editing?.enabled).toBe(true);
  });

  it('when persistence is set and onChange is called with title/changed, patchWidget is invoked', () => {
    const onChange = vi.fn();
    const patchWidget = vi.fn().mockResolvedValue(undefined);
    const widgets = [createMinimalWidget({ id: 'w1', onChange })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { patchWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const wrappedOnChange = getWidgetOnChange(result.current.widgets[0]!);
    expect(wrappedOnChange).toBeDefined();
    act(() => {
      wrappedOnChange!({ type: 'title/changed', payload: { title: 'Renamed Widget' } });
    });

    expect(patchWidget).toHaveBeenCalledWith('w1', { title: 'Renamed Widget' });
  });

  it('forwards onChange to original handler after persistence', () => {
    const onChange = vi.fn();
    const patchWidget = vi.fn().mockResolvedValue(undefined);
    const widgets = [createMinimalWidget({ id: 'w1', onChange })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { patchWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const wrappedOnChange = getWidgetOnChange(result.current.widgets[0]!);
    expect(wrappedOnChange).toBeDefined();
    act(() => {
      wrappedOnChange!({ type: 'title/changed', payload: { title: 'New Title' } });
    });

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'New Title' },
    });
  });

  it('when persistence fails, logs error but still forwards onChange', async () => {
    const onChange = vi.fn();
    const patchWidget = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const widgets = [createMinimalWidget({ id: 'w1', onChange })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { patchWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const wrappedOnChange = getWidgetOnChange(result.current.widgets[0]!);
    expect(wrappedOnChange).toBeDefined();
    await act(async () => {
      wrappedOnChange!({ type: 'title/changed', payload: { title: 'New Title' } });
      await Promise.resolve();
    });

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'New Title' },
    });
    expect(patchWidget).toHaveBeenCalledWith('w1', { title: 'New Title' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[useWidgetRenaming] Failed to persist widget rename:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it('defaults enabled to false when not provided', () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const params: UseWidgetRenamingParams = {
      widgets,
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    expect(result.current.widgets).toEqual(widgets);
    expect(result.current.widgets[0]?.config?.header?.title?.editing?.enabled).toBeUndefined();
  });

  it('when enabled without persistence, does not wrap onChange', () => {
    const onChange = vi.fn();
    const widgets = [createMinimalWidget({ id: 'w1', onChange })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    expect(getWidgetOnChange(result.current.widgets[0]!)).toBe(onChange);
  });
});
