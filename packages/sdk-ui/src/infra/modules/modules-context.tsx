import { createContext, useContext } from 'react';

import type { ModulesApiRegistry } from './build-module-registry.js';
import type { Module, RegistryOf } from './types.js';

/**
 * Modules API registry context.
 */
export const ModulesContext = createContext<ModulesApiRegistry | null>(null);

/**
 * Gives access to the API registry for a given module and field.
 *
 * @example
 * ```ts
 * const chartBuilders = useModuleApiRegistry(VisualizationsModule, 'chartBuilders');
 * ```
 * @throws if used outside a `ModuleProvider`.
 * @throws if `module` was not registered in the enclosing provider.
 *
 * @alpha
 */
export const useModuleApiRegistry = <TSchema, K extends keyof TSchema & string>(
  module: Module<TSchema>,
  field: K,
): RegistryOf<TSchema, K> => {
  const store = useContext(ModulesContext);
  if (!store) {
    throw new Error('[Module] useModuleApiRegistry must be used inside a ModuleProvider.');
  }
  if (!store.has(module.name, field)) {
    throw new Error(
      `[Module] "${module.name}" is not registered in this provider, ` +
        `or it does not declare an api field "${field}".`,
    );
  }
  return store.get(module.name, field) as RegistryOf<TSchema, K>;
};
