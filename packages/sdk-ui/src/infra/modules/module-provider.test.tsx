import { type FunctionComponent } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CoreModule, type CoreModuleApi } from './core-module.js';
import { ModuleProvider } from './module-provider.js';
import { useModuleApiRegistry } from './modules-context.js';
import type { ApiField, Module } from './types.js';

const ReadCoreProviders: FunctionComponent = () => {
  const providers = useModuleApiRegistry(CoreModule, 'providers');
  return <div data-testid="count">{providers.length}</div>;
};

describe('ModuleProvider + useModuleApiRegistry', () => {
  it('exposes the core providers registry to descendants', () => {
    const ProviderA: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => (
      <>{children}</>
    );
    const contrib: CoreModuleApi = { providers: [ProviderA] };
    const Module1: Module = {
      name: 'm1',
      version: '1.0.0',
      requires: ['core'],
      integrations: { core: contrib },
    };

    render(
      <ModuleProvider modules={[Module1]}>
        <ReadCoreProviders />
      </ModuleProvider>,
    );

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('isolates registries between sibling ModuleProviders in the same app', () => {
    const ProviderA: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => (
      <>{children}</>
    );
    const ProviderB: FunctionComponent<{ children?: React.ReactNode }> = ({ children }) => (
      <>{children}</>
    );
    const contribA: CoreModuleApi = { providers: [ProviderA] };
    const contribB: CoreModuleApi = { providers: [ProviderB, ProviderB] };
    const ModuleA: Module = {
      name: 'a',
      version: '1.0.0',
      requires: ['core'],
      integrations: { core: contribA },
    };
    const ModuleB: Module = {
      name: 'b',
      version: '1.0.0',
      requires: ['core'],
      integrations: { core: contribB },
    };

    render(
      <>
        <div data-testid="left">
          <ModuleProvider modules={[ModuleA]}>
            <ReadCoreProviders />
          </ModuleProvider>
        </div>
        <div data-testid="right">
          <ModuleProvider modules={[ModuleB]}>
            <ReadCoreProviders />
          </ModuleProvider>
        </div>
      </>,
    );

    expect(screen.getByTestId('left').textContent).toBe('1');
    expect(screen.getByTestId('right').textContent).toBe('2');
  });

  it('reads producer-specific registries via the typed hook', () => {
    interface CounterApiDefinition {
      counters: ApiField<Record<string, number>, Map<string, number>>;
    }
    const CounterModule: Module<CounterApiDefinition> = {
      name: 'counter',
      version: '1.0.0',
      api: {
        counters: {
          createRegistry: () => new Map<string, number>(),
          register: (entries, registry) => {
            for (const [k, v] of Object.entries(entries)) registry.set(k, v);
          },
        },
      },
    };
    type CounterApi = { counters?: Record<string, number> };
    const contrib: CounterApi = { counters: { a: 1, b: 2 } };
    const Contributor: Module = {
      name: 'contributor',
      version: '1.0.0',
      requires: ['counter'],
      integrations: { counter: contrib },
    };

    const Read: FunctionComponent = () => {
      const registry = useModuleApiRegistry(CounterModule, 'counters');
      return <div data-testid="sum">{[...registry.values()].reduce((s, n) => s + n, 0)}</div>;
    };

    render(
      <ModuleProvider modules={[CounterModule, Contributor]}>
        <Read />
      </ModuleProvider>,
    );

    expect(screen.getByTestId('sum').textContent).toBe('3');
  });

  it('throws when useModuleApiRegistry is called outside a ModuleProvider', () => {
    const ReadOutside: FunctionComponent = () => {
      useModuleApiRegistry(CoreModule, 'providers');
      return null;
    };

    expect(() => render(<ReadOutside />)).toThrow(/useModuleApiRegistry must be used inside/);
  });
});
