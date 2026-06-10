import { type FunctionComponent, type PropsWithChildren, useMemo } from 'react';

import { buildModuleRegistry } from './build-module-registry.js';
import { CoreModuleProvidersTree } from './core-module-providers-tree.js';
import { ModulesContext } from './modules-context.js';
import type { Module } from './types.js';

/**
 * Props for `ModuleProvider`.
 */
export interface ModuleProviderProps {
  /**
   * Modules to register.
   *
   * `CoreModule` is registered automatically; consumers do not need to list it.
   */
  modules?: ReadonlyArray<Module>;
}

/**
 * Registers the given modules and makes the API registry available to the children.
 */
export const ModuleProvider: FunctionComponent<PropsWithChildren<ModuleProviderProps>> = ({
  modules,
  children,
}) => {
  const { apiRegistry } = useMemo(() => buildModuleRegistry(modules), [modules]);

  return (
    <ModulesContext.Provider value={apiRegistry}>
      <CoreModuleProvidersTree>{children}</CoreModuleProvidersTree>
    </ModulesContext.Provider>
  );
};
