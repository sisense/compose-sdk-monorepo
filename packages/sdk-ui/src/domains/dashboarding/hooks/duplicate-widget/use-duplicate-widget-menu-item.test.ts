import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetProps } from '@/domains/widgets/components/widget/types.js';
import { WidgetHeaderMenuTargets } from '@/domains/widgets/shared/widget-header/widget-header-menu-targets.js';
import { findMenuActionByPath } from '@/shared/types/__test-helpers__/find-menu-item.js';

import {
  useDuplicateWidgetMenuItem,
  type UseDuplicateWidgetMenuItemParams,
} from './use-duplicate-widget-menu-item.js';

const createMinimalWidget = (overrides?: Partial<WidgetProps>): WidgetProps =>
  ({
    id: 'widget-1',
    widgetType: 'chart',
    dataOptions: {},
    ...overrides,
  } as WidgetProps);

const createLayout = (widgetId: string) => ({
  columns: [
    {
      widthPercentage: 100,
      rows: [
        {
          cells: [{ widthPercentage: 100, widgetId }],
        },
      ],
    },
  ],
});

function getDuplicateMenuItemOnClick(widget: WidgetProps): (() => void) | undefined {
  return findMenuActionByPath(
    widget.config?.header?.menu?.items,
    WidgetHeaderMenuTargets.DuplicateWidget,
  )?.onClick;
}

describe('useDuplicateWidgetMenuItem', () => {
  it('returns widgets unchanged when enabled is false', () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setWidgets = vi.fn();
    const setWidgetsLayout = vi.fn();
    const setWidgetsOptions = vi.fn();
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets,
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout,
      setWidgetsOptions,
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));

    expect(result.current.widgets).toEqual(widgets);
    expect(result.current.widgets[0]).not.toHaveProperty('config.header.menu');
  });

  it('returns widgets with duplicate menu item when enabled is true', () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setWidgets = vi.fn();
    const setWidgetsLayout = vi.fn();
    const setWidgetsOptions = vi.fn();
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets,
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout,
      setWidgetsOptions,
      enabled: true,
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));

    expect(result.current.widgets).not.toBe(widgets);
    expect(result.current.widgets).toHaveLength(1);
    const menuItems = result.current.widgets[0]!.config?.header?.menu?.items ?? [];
    const duplicateItem = findMenuActionByPath(menuItems, WidgetHeaderMenuTargets.DuplicateWidget);
    expect(duplicateItem).toBeDefined();
    expect(duplicateItem).toMatchObject({
      type: 'action',
      id: WidgetHeaderMenuTargets.DuplicateWidget,
      caption: 'Duplicate widget',
    });
    expect(typeof duplicateItem?.onClick).toBe('function');
  });

  it('when duplicate is clicked and widget has no layout location, does not call setters', async () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setWidgets = vi.fn();
    const setWidgetsLayout = vi.fn();
    const setWidgetsOptions = vi.fn();
    const layoutWithoutWidget = createLayout('other-widget');
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets,
      widgetsLayout: layoutWithoutWidget,
      setWidgetsLayout,
      setWidgetsOptions,
      enabled: true,
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);
    expect(onClick).toBeDefined();

    await act(async () => {
      onClick?.();
    });

    expect(setWidgets).not.toHaveBeenCalled();
    expect(setWidgetsLayout).not.toHaveBeenCalled();
    expect(setWidgetsOptions).not.toHaveBeenCalled();
  });

  it('when persistence addWidget resolves and setWidgets updater receives prev without original widget, returns prev unchanged', async () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    let capturedUpdater: ((prev: WidgetProps[]) => WidgetProps[]) | null = null;
    const setWidgets = vi.fn(
      (updater: ((prev: WidgetProps[]) => WidgetProps[]) | WidgetProps[]) => {
        if (typeof updater === 'function') {
          capturedUpdater = updater as (prev: WidgetProps[]) => WidgetProps[];
        }
      },
    );
    const setWidgetsLayout = vi.fn();
    const setWidgetsOptions = vi.fn();
    const addWidget = vi.fn().mockResolvedValue({
      widget: createMinimalWidget({ id: 'server-oid' }),
      widgetsPanelLayout: createLayout('server-oid'),
      widgetOptions: {},
    });
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets,
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout,
      setWidgetsOptions,
      enabled: true,
      persistence: { addWidget },
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);

    await act(async () => {
      onClick?.();
    });

    expect(capturedUpdater).not.toBeNull();
    const prevWithoutOriginal: WidgetProps[] = [createMinimalWidget({ id: 'other' })];
    const updated = capturedUpdater!(prevWithoutOriginal);
    expect(updated).toBe(prevWithoutOriginal);
    expect(updated).toHaveLength(1);
    expect(updated[0]!.id).toBe('other');
  });

  it('when duplicate is clicked without persistence, adds cloned widget and updates layout and options', async () => {
    const widgets = [createMinimalWidget({ id: 'w1', title: 'Original' })];
    const setWidgets = vi.fn();
    const setWidgetsLayout = vi.fn();
    const setWidgetsOptions = vi.fn();
    const layout = createLayout('w1');
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets,
      widgetsLayout: layout,
      setWidgetsLayout,
      setWidgetsOptions,
      enabled: true,
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);
    expect(onClick).toBeDefined();

    await act(async () => {
      onClick?.();
    });

    expect(setWidgets).toHaveBeenCalledTimes(1);
    const updater = setWidgets.mock.calls[0]![0] as (prev: WidgetProps[]) => WidgetProps[];
    const newWidgets = updater(widgets);
    expect(newWidgets).toHaveLength(2);
    expect(newWidgets[0]).toEqual(widgets[0]);
    expect(newWidgets[1]!.id).toMatch(
      /^w1-copy-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(newWidgets[1]).toMatchObject({ title: 'Original' });

    expect(setWidgetsLayout).toHaveBeenCalledTimes(1);
    const newLayout = setWidgetsLayout.mock.calls[0]![0];
    expect(newLayout.columns[0]!.rows[0]!.cells).toHaveLength(2);
    expect(newLayout.columns[0]!.rows[0]!.cells[0]!.widgetId).toBe('w1');
    expect(newLayout.columns[0]!.rows[0]!.cells[1]!.widgetId).toMatch(
      /^w1-copy-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    expect(setWidgetsOptions).toHaveBeenCalledTimes(1);
    const optionsUpdater = setWidgetsOptions.mock.calls[0]![0] as (
      prev: Record<string, unknown>,
    ) => Record<string, unknown>;
    const newOptions = optionsUpdater({});
    expect(Object.keys(newOptions)).toHaveLength(1);
    expect(Object.keys(newOptions)[0]).toMatch(
      /^w1-copy-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('when duplicate is clicked with widgetsOptions, passes original widget options to setWidgetsOptions', async () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setWidgets = vi.fn();
    const setWidgetsLayout = vi.fn();
    const setWidgetsOptions = vi.fn();
    const widgetsOptions = { w1: {} };
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets,
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout,
      setWidgetsOptions,
      widgetsOptions,
      enabled: true,
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);

    await act(async () => {
      onClick?.();
    });

    const optionsUpdater = setWidgetsOptions.mock.calls[0]![0] as (
      prev: Record<string, unknown>,
    ) => Record<string, unknown>;
    const newOptions = optionsUpdater({});
    const duplicateKey = Object.keys(newOptions).find((k) => k.startsWith('w1-copy-'));
    expect(duplicateKey).toBeDefined();
    expect(newOptions[duplicateKey!]).toEqual({});
  });

  it('when duplicate is clicked with persistence, calls addWidget and updates state with stored id and layout', async () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setWidgets = vi.fn();
    const setWidgetsLayout = vi.fn();
    const setWidgetsOptions = vi.fn();
    const layout = createLayout('w1');
    const storedLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widthPercentage: 50, widgetId: 'w1' },
                { widthPercentage: 50, widgetId: 'server-widget-oid' },
              ],
            },
          ],
        },
      ],
    };
    const addWidget = vi.fn().mockResolvedValue({
      widget: createMinimalWidget({ id: 'server-widget-oid' }),
      widgetsPanelLayout: storedLayout,
      widgetOptions: { storedOption: true },
    });
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets,
      widgetsLayout: layout,
      setWidgetsLayout,
      setWidgetsOptions,
      enabled: true,
      persistence: { addWidget },
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);

    await act(async () => {
      onClick?.();
    });

    expect(addWidget).toHaveBeenCalledTimes(1);
    expect(addWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringMatching(
          /^w1-copy-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        ),
      }),
      expect.any(Object),
      undefined,
      undefined,
    );

    expect(setWidgets).toHaveBeenCalledTimes(1);
    const updater = setWidgets.mock.calls[0]![0] as (prev: WidgetProps[]) => WidgetProps[];
    const newWidgets = updater(widgets);
    expect(newWidgets).toHaveLength(2);
    expect(newWidgets[1]!.id).toBe('server-widget-oid');

    expect(setWidgetsLayout).toHaveBeenCalledWith(storedLayout);
    expect(setWidgetsOptions).toHaveBeenCalledTimes(1);
    const optionsUpdater = setWidgetsOptions.mock.calls[0]![0] as (
      prev: Record<string, unknown>,
    ) => Record<string, unknown>;
    const newOptions = optionsUpdater({});
    expect(newOptions['server-widget-oid']).toEqual({ storedOption: true });
  });

  it('without persistence, copies the source tabber config to the cloned widget id', async () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setWidgetsOptions = vi.fn();
    const setTabbersConfig = vi.fn();
    const tabbersConfig = {
      w1: { tabs: [{ displayWidgetIds: ['a', 'b'] }, { displayWidgetIds: ['c'] }] },
    };
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets: vi.fn(),
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout: vi.fn(),
      setWidgetsOptions,
      tabbersConfig,
      setTabbersConfig,
      enabled: true,
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);

    await act(async () => {
      onClick?.();
    });

    expect(setTabbersConfig).toHaveBeenCalledTimes(1);
    const tabbersUpdater = setTabbersConfig.mock.calls[0]![0] as (
      prev: Record<string, unknown>,
    ) => Record<string, unknown>;
    const newTabbers = tabbersUpdater({});
    const duplicateKey = Object.keys(newTabbers).find((k) => k.startsWith('w1-copy-'));
    expect(duplicateKey).toBeDefined();
    expect(newTabbers[duplicateKey!]).toEqual(tabbersConfig.w1);
  });

  it('does not touch tabbers config when the duplicated widget is not a tabber', async () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setTabbersConfig = vi.fn();
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets: vi.fn(),
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout: vi.fn(),
      setWidgetsOptions: vi.fn(),
      // a different widget owns a tabber config; the duplicated 'w1' is not a tabber
      tabbersConfig: { 'some-tabber': { tabs: [{ displayWidgetIds: ['w1'] }] } },
      setTabbersConfig,
      enabled: true,
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);

    await act(async () => {
      onClick?.();
    });

    expect(setTabbersConfig).not.toHaveBeenCalled();
  });

  it('with persistence, forwards the tabber config to addWidget and stores the returned config under the new id', async () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const setTabbersConfig = vi.fn();
    const tabberConfig = { tabs: [{ displayWidgetIds: ['a', 'b'] }] };
    const addWidget = vi.fn().mockResolvedValue({
      widget: createMinimalWidget({ id: 'server-widget-oid' }),
      widgetsPanelLayout: createLayout('server-widget-oid'),
      widgetOptions: {},
      tabberConfig,
    });
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets: vi.fn(),
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout: vi.fn(),
      setWidgetsOptions: vi.fn(),
      tabbersConfig: { w1: tabberConfig },
      setTabbersConfig,
      enabled: true,
      persistence: { addWidget },
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));
    const onClick = getDuplicateMenuItemOnClick(result.current.widgets[0]!);

    await act(async () => {
      onClick?.();
    });

    // The source tabber config is passed as the 4th addWidget argument.
    expect(addWidget).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      undefined,
      tabberConfig,
    );

    expect(setTabbersConfig).toHaveBeenCalledTimes(1);
    const tabbersUpdater = setTabbersConfig.mock.calls[0]![0] as (
      prev: Record<string, unknown>,
    ) => Record<string, unknown>;
    const newTabbers = tabbersUpdater({});
    expect(newTabbers['server-widget-oid']).toEqual(tabberConfig);
  });

  it('defaults enabled to false when not provided', () => {
    const widgets = [createMinimalWidget({ id: 'w1' })];
    const params: UseDuplicateWidgetMenuItemParams = {
      widgets,
      setWidgets: vi.fn(),
      widgetsLayout: createLayout('w1'),
      setWidgetsLayout: vi.fn(),
      setWidgetsOptions: vi.fn(),
    };

    const { result } = renderHook(() => useDuplicateWidgetMenuItem(params));

    expect(result.current.widgets).toEqual(widgets);
    expect(result.current.widgets[0]).not.toHaveProperty('config.header.menu.items');
  });
});
