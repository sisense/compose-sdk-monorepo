import type { ReactNode } from 'react';

import { render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TabberButtonsWidget } from '@/domains/widgets/components/tabber-buttons-widget';
import {
  BUILT_IN_WIDGET_DEFINITIONS,
  type WidgetDefinitionRegistry,
} from '@/domains/widgets/widget-definitions';

import { PluginProvider } from './plugin-provider.js';
import type { Plugin } from './types.js';
import { useWidgetDefinitionRegistry } from './use-widget-definition-registry.js';

const RegistryConsumer = () => {
  const registry = useWidgetDefinitionRegistry();
  const hasTabber = registry.hasComponent('tabber-buttons');
  return <div data-testid="registry-consumer">{hasTabber ? 'has-tabber' : 'no-tabber'}</div>;
};

describe('PluginProvider', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const TEST_SDK_VERSION = '2.0.0';

  beforeEach(() => {
    vi.stubGlobal('__PACKAGE_VERSION__', TEST_SDK_VERSION);
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should render children without plugins', () => {
    const { container } = render(
      <PluginProvider plugins={[]}>
        <div>Test Child</div>
      </PluginProvider>,
    );

    expect(container.textContent).toBe('Test Child');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should provide registry with built-in tabber-buttons widget', () => {
    const { getByTestId } = render(
      <PluginProvider plugins={[]}>
        <RegistryConsumer />
      </PluginProvider>,
    );

    expect(getByTestId('registry-consumer').textContent).toBe('has-tabber');
  });

  it('should render children with valid plugins', () => {
    const plugins: Plugin[] = [
      { name: 'test-plugin', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
    ];

    const { container } = render(
      <PluginProvider plugins={plugins}>
        <div>Test Child</div>
      </PluginProvider>,
    );

    expect(container.textContent).toBe('Test Child');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should warn about mismatching plugin required API versions', () => {
    const plugins: Plugin[] = [
      {
        name: 'invalid-plugin',
        version: '1.0.0',
        requiredApiVersion: '^100.0.0',
        pluginType: 'widget',
      },
    ];

    render(
      <PluginProvider plugins={plugins}>
        <div>Test Child</div>
      </PluginProvider>,
    );

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Plugin]'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid-plugin'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('requires API versions'));
  });

  describe('widget definitions', () => {
    const renderRegistry = (plugins: Plugin[]): WidgetDefinitionRegistry =>
      renderHook(() => useWidgetDefinitionRegistry(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PluginProvider plugins={plugins}>{children}</PluginProvider>
        ),
      }).result.current;

    const widgetPlugin = (customWidgetName: string, Component: () => null): Plugin => ({
      name: `${customWidgetName}-plugin`,
      version: '1.0.0',
      requiredApiVersion: '^2.0.0',
      pluginType: 'widget',
      customWidget: {
        name: customWidgetName,
        displayName: 'Plugin Widget',
        visualization: { Component },
        dataPanel: { config: { inputs: [{ name: 'category', type: 'dimension' }] } },
      },
    });

    it('should resolve the built-in tabber through the static map', () => {
      const registry = renderRegistry([]);

      expect(registry.get('custom:tabber-buttons')).toBe(
        BUILT_IN_WIDGET_DEFINITIONS.get('custom:tabber-buttons'),
      );
      expect(registry.getComponent('tabber-buttons')).toBe(TabberButtonsWidget);
      expect(registry.getAll('plugin')).toEqual([]);
    });

    it('should register a plugin named "line" as custom:line without shadowing a built-in', () => {
      const Component = vi.fn(() => null);

      const registry = renderRegistry([widgetPlugin('line', Component)]);

      expect(registry.get('custom:line', 'plugin')).toMatchObject({
        key: 'custom:line',
        displayName: 'Plugin Widget',
        visualization: { Component },
        dataPanel: { config: { inputs: [{ name: 'category', type: 'dimension' }] } },
      });
      expect(registry.getComponent('line')).toBe(Component);
      expect(registry.has('line')).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should ignore a plugin named "tabber-buttons" with one [Plugin] warning', () => {
      const registry = renderRegistry([
        widgetPlugin(
          'tabber-buttons',
          vi.fn(() => null),
        ),
      ]);

      expect(registry.getComponent('tabber-buttons')).toBe(TabberButtonsWidget);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Plugin]'));
    });
  });
});
