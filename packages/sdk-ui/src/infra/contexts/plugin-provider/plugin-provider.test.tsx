import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PluginProvider } from './plugin-provider';
import { Plugin } from './types';

describe('PluginProvider', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const TEST_SDK_VERSION = '2.0.0';

  beforeEach(() => {
    /** Control __PACKAGE_VERSION__ (injected by Vite) so plugin version validation is deterministic. */
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

  it('should render children with valid plugins', () => {
    const plugins: Plugin[] = [
      { name: 'test-plugin', version: '1.0.0', requiredApiVersion: '^2.0.0' },
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
      { name: 'invalid-plugin', version: '1.0.0', requiredApiVersion: '^100.0.0' },
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
