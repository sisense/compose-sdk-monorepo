import { createAttribute } from '@sisense/sdk-data';
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

/** Narrows away `undefined`, failing the test when the value is missing. */
function defined<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Expected a defined value');
  return value;
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

  it('when persistence is set and onChange is called with title/changed, updateWidget is invoked', () => {
    const onChange = vi.fn();
    const updateWidget = vi.fn().mockResolvedValue(undefined);
    const widgets = [createMinimalWidget({ id: 'w1', onChange })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { updateWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const wrappedOnChange = getWidgetOnChange(result.current.widgets[0]);
    expect(wrappedOnChange).toBeDefined();
    act(() => {
      defined(wrappedOnChange)({ type: 'title/changed', payload: { title: 'Renamed Widget' } });
    });

    expect(updateWidget).toHaveBeenCalledWith('w1', { title: 'Renamed Widget' });
  });

  it('forwards onChange to original handler after persistence', () => {
    const onChange = vi.fn();
    const updateWidget = vi.fn().mockResolvedValue(undefined);
    const widgets = [createMinimalWidget({ id: 'w1', onChange })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { updateWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const wrappedOnChange = getWidgetOnChange(result.current.widgets[0]);
    expect(wrappedOnChange).toBeDefined();
    act(() => {
      defined(wrappedOnChange)({ type: 'title/changed', payload: { title: 'New Title' } });
    });

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'New Title' },
    });
  });

  it('when persistence fails, logs error but still forwards onChange', async () => {
    const onChange = vi.fn();
    const updateWidget = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const widgets = [createMinimalWidget({ id: 'w1', onChange })];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { updateWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const wrappedOnChange = getWidgetOnChange(result.current.widgets[0]);
    expect(wrappedOnChange).toBeDefined();
    await act(async () => {
      defined(wrappedOnChange)({ type: 'title/changed', payload: { title: 'New Title' } });
      await Promise.resolve();
    });

    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'New Title' },
    });
    expect(updateWidget).toHaveBeenCalledWith('w1', { title: 'New Title' });
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

    expect(getWidgetOnChange(result.current.widgets[0])).toBe(onChange);
  });

  it('FilterWidget: wraps the unified onChange for persistence on title/changed', () => {
    const onChange = vi.fn();
    const updateWidget = vi.fn().mockResolvedValue(undefined);
    const widgets = [
      createMinimalWidget({
        id: 'fw-1',
        widgetType: 'filter',
        attribute: createAttribute({
          name: 'Country',
          expression: '[Country]',
          type: 'text-attribute',
        }),
        onChange,
      } as Partial<WidgetProps>),
    ];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { updateWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const fw = result.current.widgets[0];
    const wrappedOnChange = defined(getWidgetOnChange(fw));
    expect(wrappedOnChange).not.toBe(onChange);
    act(() => {
      wrappedOnChange({ type: 'title/changed', payload: { title: 'My Filter' } });
    });

    expect(updateWidget).toHaveBeenCalledWith('fw-1', { title: 'My Filter' });
    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'My Filter' },
    });
    expect(fw.config?.header?.title?.editing?.enabled).toBe(true);
  });

  it('FilterWidget: forwards non-title events (e.g. filter/changed) without persistence calls', () => {
    const onChange = vi.fn();
    const updateWidget = vi.fn().mockResolvedValue(undefined);
    const widgets = [
      createMinimalWidget({
        id: 'fw-1',
        widgetType: 'filter',
        attribute: createAttribute({
          name: 'Country',
          expression: '[Country]',
          type: 'text-attribute',
        }),
        onChange,
      } as Partial<WidgetProps>),
    ];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { updateWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const event = { type: 'filter/changed', payload: { filter: null } } as const;
    act(() => {
      defined(getWidgetOnChange(result.current.widgets[0]))(event);
    });

    expect(updateWidget).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(event);
  });

  describe('custom widget', () => {
    const createCustomWidget = (onChange = vi.fn()) =>
      createMinimalWidget({
        id: 'cw-1',
        widgetType: 'custom',
        title: 'Old Title',
        onChange,
      } as Partial<WidgetProps>);

    it('persists title/changed via updateWidget and forwards it to the original onChange', () => {
      const onChange = vi.fn();
      const updateWidget = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useWidgetRenaming({
          widgets: [createCustomWidget(onChange)],
          enabled: true,
          persistence: { updateWidget },
        }),
      );

      const widget = result.current.widgets[0];
      expect(widget?.config?.header?.title?.editing?.enabled).toBe(true);
      const event: WidgetChangeEvent = { type: 'title/changed', payload: { title: 'Renamed' } };
      act(() => {
        defined(getWidgetOnChange(widget))(event);
      });

      expect(updateWidget).toHaveBeenCalledWith('cw-1', { title: 'Renamed' });
      expect(onChange).toHaveBeenCalledWith(event);
    });

    it('forwards visualizationState/changed without persisting it as a rename', () => {
      const onChange = vi.fn();
      const updateWidget = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useWidgetRenaming({
          widgets: [createCustomWidget(onChange)],
          enabled: true,
          persistence: { updateWidget },
        }),
      );

      const event: WidgetChangeEvent = {
        type: 'visualizationState/changed',
        payload: { customOptions: { lastPage: 3 } },
      };
      act(() => {
        defined(getWidgetOnChange(result.current.widgets[0]))(event);
      });

      expect(updateWidget).not.toHaveBeenCalled();
      expect(onChange).toHaveBeenCalledWith(event);
    });
  });

  it('NarrativeWidget: wraps the unified onChange for persistence on title/changed', () => {
    const onChange = vi.fn();
    const updateWidget = vi.fn().mockResolvedValue(undefined);
    const widgets = [
      createMinimalWidget({
        id: 'nw-1',
        widgetType: 'narrative',
        onChange,
      } as Partial<WidgetProps>),
    ];
    const params: UseWidgetRenamingParams = {
      widgets,
      enabled: true,
      persistence: { updateWidget },
    };

    const { result } = renderHook(() => useWidgetRenaming(params));

    const nw = result.current.widgets[0];
    const wrappedOnChange = defined(getWidgetOnChange(nw));
    expect(wrappedOnChange).not.toBe(onChange);
    act(() => {
      wrappedOnChange({ type: 'title/changed', payload: { title: 'My Narrative' } });
    });

    expect(updateWidget).toHaveBeenCalledWith('nw-1', { title: 'My Narrative' });
    expect(onChange).toHaveBeenCalledWith({
      type: 'title/changed',
      payload: { title: 'My Narrative' },
    });
    expect(nw.config?.header?.title?.editing?.enabled).toBe(true);
  });
});
