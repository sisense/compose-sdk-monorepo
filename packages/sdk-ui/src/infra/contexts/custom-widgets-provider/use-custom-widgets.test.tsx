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
});
