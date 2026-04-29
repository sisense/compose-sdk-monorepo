import { PropsWithChildren } from 'react';

import { act, renderHook } from '@testing-library/react';

import { PluginContext } from '@/infra/plugins/plugin-context';
import { WidgetPluginRegistry } from '@/infra/plugins/widget-plugins/widget-plugin-registry';

import { CustomWidgetComponent } from './types';
import { useCustomWidgets } from './use-custom-widgets';

const createWrapper =
  (widgetRegistry: WidgetPluginRegistry) =>
  ({ children }: PropsWithChildren) =>
    (
      <PluginContext.Provider value={{ widgetPlugins: [], widgetRegistry }}>
        {children}
      </PluginContext.Provider>
    );

describe('useCustomWidgets', () => {
  it('registers and exposes custom widgets via PluginContext', () => {
    const widgetRegistry = new WidgetPluginRegistry();
    const Wrapper = createWrapper(widgetRegistry);

    const widgetA: CustomWidgetComponent = vi.fn(() => null);
    const widgetB: CustomWidgetComponent = vi.fn(() => null);

    const { result } = renderHook(() => useCustomWidgets(), { wrapper: Wrapper });

    act(() => result.current.registerCustomWidget('widget-a', widgetA));

    expect(widgetRegistry.getComponent('widget-a')).toBe(widgetA);
    expect(result.current.hasCustomWidget('widget-a')).toBe(true);
    expect(result.current.getCustomWidget('widget-a')).toBe(widgetA);

    act(() => result.current.registerCustomWidget('widget-a', widgetB));

    expect(widgetRegistry.getComponent('widget-a')).toBe(widgetA);
    expect(result.current.hasCustomWidget('missing')).toBe(false);
  });

  it('returns only legacy registrations; plugin entries are not visible', () => {
    const widgetRegistry = new WidgetPluginRegistry();
    const Wrapper = createWrapper(widgetRegistry);

    const pluginWidget = vi.fn(() => null);
    const legacyWidget = vi.fn(() => null);

    widgetRegistry.register('shared-type', pluginWidget, 'plugin');

    const { result } = renderHook(() => useCustomWidgets(), { wrapper: Wrapper });

    expect(result.current.hasCustomWidget('shared-type')).toBe(false);
    expect(result.current.getCustomWidget('shared-type')).toBeUndefined();

    act(() => result.current.registerCustomWidget('shared-type', legacyWidget));
    expect(result.current.hasCustomWidget('shared-type')).toBe(false);
    expect(result.current.getCustomWidget('shared-type')).toBeUndefined();

    act(() => result.current.registerCustomWidget('legacy-only', legacyWidget));
    expect(result.current.hasCustomWidget('legacy-only')).toBe(true);
    expect(result.current.getCustomWidget('legacy-only')).toBe(legacyWidget);
  });

  it('unregisterCustomWidget removes a legacy registration', () => {
    const widgetRegistry = new WidgetPluginRegistry();
    const Wrapper = createWrapper(widgetRegistry);
    const widget: CustomWidgetComponent = vi.fn(() => null);

    const { result } = renderHook(() => useCustomWidgets(), { wrapper: Wrapper });

    act(() => result.current.registerCustomWidget('widget-x', widget));
    expect(result.current.hasCustomWidget('widget-x')).toBe(true);

    act(() => result.current.unregisterCustomWidget('widget-x'));

    expect(result.current.hasCustomWidget('widget-x')).toBe(false);
    expect(result.current.getCustomWidget('widget-x')).toBeUndefined();
    expect(widgetRegistry.getComponent('widget-x', 'legacy')).toBeUndefined();
  });

  it('unregisterCustomWidget for unknown type does not throw', () => {
    const widgetRegistry = new WidgetPluginRegistry();
    const Wrapper = createWrapper(widgetRegistry);
    const { result } = renderHook(() => useCustomWidgets(), { wrapper: Wrapper });

    expect(() =>
      act(() => result.current.unregisterCustomWidget('never-registered')),
    ).not.toThrow();
    expect(result.current.hasCustomWidget('never-registered')).toBe(false);
  });

  it('unregisterCustomWidget does not remove plugin-sourced widgets', () => {
    const widgetRegistry = new WidgetPluginRegistry();
    const Wrapper = createWrapper(widgetRegistry);
    const pluginWidget = vi.fn(() => null);

    widgetRegistry.register('plugin-only', pluginWidget, 'plugin');

    const { result } = renderHook(() => useCustomWidgets(), { wrapper: Wrapper });

    act(() => result.current.unregisterCustomWidget('plugin-only'));

    expect(widgetRegistry.getComponent('plugin-only', 'plugin')).toBe(pluginWidget);
    expect(result.current.hasCustomWidget('plugin-only')).toBe(false);
  });

  it('allows registering a new legacy widget after unregister', () => {
    const widgetRegistry = new WidgetPluginRegistry();
    const Wrapper = createWrapper(widgetRegistry);
    const widgetA: CustomWidgetComponent = vi.fn(() => null);
    const widgetB: CustomWidgetComponent = vi.fn(() => null);

    const { result } = renderHook(() => useCustomWidgets(), { wrapper: Wrapper });

    act(() => result.current.registerCustomWidget('reusable-type', widgetA));
    act(() => result.current.unregisterCustomWidget('reusable-type'));
    act(() => result.current.registerCustomWidget('reusable-type', widgetB));

    expect(result.current.getCustomWidget('reusable-type')).toBe(widgetB);
    expect(widgetRegistry.getComponent('reusable-type', 'legacy')).toBe(widgetB);
  });
});
