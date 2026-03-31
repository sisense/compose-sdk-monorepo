import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PluginProvider } from './plugin-provider.js';
import { Plugin } from './types.js';
import { useWidgetPluginRegistry } from './use-widget-plugin-registry.js';

const RegistryConsumer = () => {
  const registry = useWidgetPluginRegistry();
  const hasTabber = registry.has('tabber-buttons');
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
});
