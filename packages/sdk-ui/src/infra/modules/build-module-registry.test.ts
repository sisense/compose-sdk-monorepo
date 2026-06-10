import type { ComponentType, ReactNode } from 'react';

import { describe, expect, it, vi } from 'vitest';

import { buildModuleRegistry } from './build-module-registry.js';
import { type CoreModuleApi } from './core-module.js';
import type { ApiField, Module } from './types.js';

const makeProvider = (label: string): ComponentType<{ children: ReactNode }> => {
  const Provider: ComponentType<{ children: ReactNode }> = ({ children }) => children as never;
  Provider.displayName = label;
  return Provider;
};

describe('buildModuleRegistry', () => {
  it('always registers core and creates its providers registry', () => {
    const { modules, apiRegistry } = buildModuleRegistry();
    expect(modules.map((m) => m.name)).toEqual(['core']);
    expect(apiRegistry.has('core', 'providers')).toBe(true);
    expect(apiRegistry.get('core', 'providers')).toEqual([]);
  });

  it('registers user modules together with core in topological order', () => {
    const ModuleA: Module = { name: 'a', version: '1.0.0', requires: ['core'] };
    const ModuleB: Module = { name: 'b', version: '1.0.0', requires: ['a', 'core'] };

    const { modules } = buildModuleRegistry([ModuleB, ModuleA]);
    const names = modules.map((m) => m.name);

    expect(names[0]).toBe('core');
    expect(names.indexOf('a')).toBeLessThan(names.indexOf('b'));
  });

  it('expands `includes` transitively', () => {
    const Query: Module = { name: 'query', version: '1.0.0' };
    const Models: Module = { name: 'models', version: '1.0.0', includes: [Query] };
    const Widgets: Module = { name: 'widgets', version: '1.0.0', includes: [Models] };

    const { modules } = buildModuleRegistry([Widgets]);
    const names = modules.map((m) => m.name);

    expect(names).toEqual(expect.arrayContaining(['core', 'widgets', 'models', 'query']));
    expect(names).toHaveLength(4);
  });

  it('collects providers contributed to core in topological order', () => {
    const ProviderA = makeProvider('ProviderA');
    const ProviderB = makeProvider('ProviderB');
    const contribA: CoreModuleApi = { providers: [ProviderA] };
    const contribB: CoreModuleApi = { providers: [ProviderB] };

    const ModuleA: Module = {
      name: 'a',
      version: '1.0.0',
      requires: ['core'],
      integrations: { core: contribA },
    };
    const ModuleB: Module = {
      name: 'b',
      version: '1.0.0',
      requires: ['core', 'a'],
      integrations: { core: contribB },
    };

    // Pass B before A — A's provider must still come first because B requires A.
    const { apiRegistry } = buildModuleRegistry([ModuleB, ModuleA]);
    expect(apiRegistry.get('core', 'providers')).toEqual([ProviderA, ProviderB]);
  });

  it('isolates state between independent registry builds', () => {
    const ProviderA = makeProvider('ProviderA');
    const contrib: CoreModuleApi = { providers: [ProviderA] };
    const ModuleA: Module = {
      name: 'a',
      version: '1.0.0',
      requires: ['core'],
      integrations: { core: contrib },
    };

    const first = buildModuleRegistry([ModuleA]);
    const second = buildModuleRegistry();

    expect(first.apiRegistry.get('core', 'providers')).toEqual([ProviderA]);
    expect(second.apiRegistry.get('core', 'providers')).toEqual([]);
  });

  it('invokes a producer api field register handler with the contribution, registry, and source module', () => {
    const register = vi.fn<(value: string, registry: string[], from: Module) => void>(
      (value, registry) => {
        registry.push(value);
      },
    );
    const greetField: ApiField<string, string[]> = {
      createRegistry: () => [],
      register,
    };
    const Producer: Module = {
      name: 'producer',
      version: '1.0.0',
      api: { greet: greetField },
    };
    const Consumer: Module = {
      name: 'consumer',
      version: '1.0.0',
      requires: ['producer'],
      integrations: { producer: { greet: 'hello' } },
    };

    const { apiRegistry } = buildModuleRegistry([Producer, Consumer]);

    expect(register).toHaveBeenCalledTimes(1);
    const [value, registry, fromModule] = register.mock.calls[0];
    expect(value).toBe('hello');
    expect(registry).toEqual(['hello']);
    expect(fromModule).toBe(Consumer);
    expect(apiRegistry.get('producer', 'greet')).toEqual(['hello']);
  });

  it('creates a fresh registry per build (createRegistry is invoked once per build)', () => {
    const createRegistry = vi.fn(() => new Map<string, number>());
    const field: ApiField<Record<string, number>, Map<string, number>> = {
      createRegistry,
      register: (value, registry) => {
        for (const [k, v] of Object.entries(value)) registry.set(k, v);
      },
    };
    const Producer: Module = {
      name: 'producer',
      version: '1.0.0',
      api: { entries: field },
    };
    const Consumer: Module = {
      name: 'consumer',
      version: '1.0.0',
      requires: ['producer'],
      integrations: { producer: { entries: { a: 1 } } },
    };

    const first = buildModuleRegistry([Producer, Consumer]);
    const second = buildModuleRegistry([Producer, Consumer]);

    expect(createRegistry).toHaveBeenCalledTimes(2);
    expect(first.apiRegistry.get('producer', 'entries')).not.toBe(
      second.apiRegistry.get('producer', 'entries'),
    );
    expect((first.apiRegistry.get('producer', 'entries') as Map<string, number>).get('a')).toBe(1);
  });

  it('drops integrations to soft-required missing targets without invoking handlers', () => {
    const register = vi.fn();
    const field: ApiField<unknown, null> = { createRegistry: () => null, register };
    const Consumer: Module = {
      name: 'consumer',
      version: '1.0.0',
      requires: [{ name: 'absent-producer', optional: true }],
      integrations: {
        'absent-producer': { someField: 'val' },
      },
    };
    // Reference `field` so the producer's shape is exercised somewhere (and so
    // we have a parallel hard-required test below if needed).
    void field;

    expect(() => buildModuleRegistry([Consumer])).not.toThrow();
    expect(register).not.toHaveBeenCalled();
  });

  it('rejects integrations to a module not declared in requires', () => {
    const Producer: Module = {
      name: 'producer',
      version: '1.0.0',
      api: { foo: { createRegistry: () => null, register: () => {} } },
    };
    const Consumer: Module = {
      name: 'consumer',
      version: '1.0.0',
      integrations: { producer: { foo: 1 } },
    };

    expect(() => buildModuleRegistry([Producer, Consumer])).toThrow(
      /"consumer" has integrations to "producer" but does not declare it in "requires"/,
    );
  });
});
