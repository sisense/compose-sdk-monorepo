import { type ReactNode, useContext } from 'react';

import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WidgetDefinitionRegistry } from '@/domains/widgets/widget-definitions';

import { SisenseContextProvider } from '../contexts/sisense-context/sisense-context-provider.js';
import {
  CustomPluginContextProvider,
  type CustomPluginContextProviderProps,
} from './custom-plugin-context-provider.js';
import { PluginContext, type PluginContextValue } from './plugin-context.js';
import { useWidgetDefinitionRegistry } from './use-widget-definition-registry.js';

vi.mock('../app/client-application', () => ({
  // Never resolves: the provider renders its children without a client application.
  createClientApplication: vi.fn(() => new Promise(() => {})),
}));

type Snapshot = { registry: WidgetDefinitionRegistry; contextValue: PluginContextValue | null };

const createProbe = () => {
  const snapshots: Snapshot[] = [];
  const Probe = () => {
    const registry = useWidgetDefinitionRegistry();
    const contextValue = useContext(PluginContext);
    snapshots.push({ registry, contextValue });
    return null;
  };
  return { snapshots, Probe };
};

/** Counts distinct identities seen across renders; 1 means the reference never changed. */
const countDistinctIdentities = (snapshots: readonly Snapshot[]) => ({
  renders: snapshots.length,
  registries: new Set(snapshots.map((snapshot) => snapshot.registry)).size,
  contextValues: new Set(snapshots.map((snapshot) => snapshot.contextValue)).size,
});

describe('plugin context stability without plugins', () => {
  beforeEach(() => {
    vi.stubGlobal('__PACKAGE_VERSION__', '2.0.0');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the registry and context value stable across CustomPluginContextProvider re-renders', () => {
    const { snapshots, Probe } = createProbe();
    // Framework wrappers may mount the provider before any plugin context is available.
    const noContextProps = {} as CustomPluginContextProviderProps;
    const renderTree = (child: ReactNode) => (
      <CustomPluginContextProvider {...noContextProps}>{child}</CustomPluginContextProvider>
    );

    const { rerender } = render(renderTree(<Probe />));
    rerender(renderTree(<Probe />));
    rerender(renderTree(<Probe />));

    expect(countDistinctIdentities(snapshots)).toEqual({
      renders: expect.any(Number),
      registries: 1,
      contextValues: 1,
    });
    expect(snapshots.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps the registry and context value stable across SisenseContextProvider re-renders', async () => {
    const { snapshots, Probe } = createProbe();
    const renderTree = (child: ReactNode) => (
      <SisenseContextProvider url="http://localhost" token="token">
        {child}
      </SisenseContextProvider>
    );

    const { rerender } = render(renderTree(<Probe />));
    // Children mount once translations are initialized.
    await waitFor(() => expect(snapshots.length).toBeGreaterThan(0));
    rerender(renderTree(<Probe />));
    rerender(renderTree(<Probe />));

    expect(countDistinctIdentities(snapshots)).toEqual({
      renders: expect.any(Number),
      registries: 1,
      contextValues: 1,
    });
    expect(snapshots.length).toBeGreaterThanOrEqual(3);
  });
});
