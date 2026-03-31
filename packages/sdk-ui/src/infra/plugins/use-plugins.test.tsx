import { PropsWithChildren } from 'react';

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PluginProvider } from './plugin-provider.js';
import { Plugin } from './types.js';
import { usePlugins } from './use-plugins.js';

const createWrapper = (plugins: Plugin[]) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <PluginProvider plugins={plugins}>{children}</PluginProvider>;
  };

describe('usePlugins', () => {
  const TEST_SDK_VERSION = '2.0.0';

  beforeEach(() => {
    vi.stubGlobal('__PACKAGE_VERSION__', TEST_SDK_VERSION);
  });

  it('returns hasPlugin false and getPlugin undefined when plugins array is empty', () => {
    const { result } = renderHook(() => usePlugins(), {
      wrapper: createWrapper([]),
    });

    expect(result.current.hasPlugin('any-plugin')).toBe(false);
    expect(result.current.getPlugin('any-plugin')).toBeUndefined();
  });

  it('returns hasPlugin true when plugin with given name exists', () => {
    const plugins: Plugin[] = [
      {
        name: 'test-plugin',
        version: '1.0.0',
        requiredApiVersion: '^2.0.0',
        pluginType: 'widget',
      },
    ];

    const { result } = renderHook(() => usePlugins(), {
      wrapper: createWrapper(plugins),
    });

    expect(result.current.hasPlugin('test-plugin')).toBe(true);
    expect(result.current.hasPlugin('other-plugin')).toBe(false);
  });

  it('returns getPlugin with plugin object when found', () => {
    const plugin: Plugin = {
      name: 'my-widget-plugin',
      version: '2.0.0',
      requiredApiVersion: '^2.0.0',
      pluginType: 'widget',
    };
    const plugins: Plugin[] = [plugin];

    const { result } = renderHook(() => usePlugins(), {
      wrapper: createWrapper(plugins),
    });

    expect(result.current.getPlugin('my-widget-plugin')).toEqual(plugin);
    expect(result.current.getPlugin('missing')).toBeUndefined();
  });

  it('works with multiple plugins', () => {
    const plugins: Plugin[] = [
      { name: 'plugin-a', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
      { name: 'plugin-b', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
    ];

    const { result } = renderHook(() => usePlugins(), {
      wrapper: createWrapper(plugins),
    });

    expect(result.current.hasPlugin('plugin-a')).toBe(true);
    expect(result.current.hasPlugin('plugin-b')).toBe(true);
    expect(result.current.hasPlugin('plugin-c')).toBe(false);
    expect(result.current.getPlugin('plugin-a')?.name).toBe('plugin-a');
    expect(result.current.getPlugin('plugin-b')?.name).toBe('plugin-b');
  });
});
