import { buildModuleGraph, type ResolvedModule } from './build-module-graph.js';
import { CoreModule } from './core-module.js';
import type { ApiField, Module } from './types.js';

/**
 * Modules API registry.
 *
 * Each registry is an opaque value produced by the owning module's
 * `ApiField.createRegistry` and written to by every contributor's
 * `ApiField.register`. Keyed by `(moduleName, fieldName)` to keep field names
 * scoped to their owning module.
 */
export interface ModulesApiRegistry {
  /** Returns the registry for a module's API field, or `undefined` if absent. */
  get(moduleName: string, fieldName: string): unknown;
  /** Whether the given module's API field has a registry in this store. */
  has(moduleName: string, fieldName: string): boolean;
}

/** Result of building a module registry from a set of user-provided modules. */
export interface ModulesRegistry {
  /** Registered modules array (in topological order) */
  modules: Module[];
  /** Modules api registry. */
  apiRegistry: ModulesApiRegistry;
}

const registryKey = (moduleName: string, fieldName: string): string => `${moduleName}.${fieldName}`;

/**
 * Creates a fresh registry for every API field across the resolved modules.
 * Each `createRegistry` is invoked exactly once, so each `ModuleProvider`
 * instance owns isolated state.
 */
const createModulesApiRegistry = (
  resolvedModules: ReadonlyArray<ResolvedModule>,
): Map<string, unknown> => {
  const registries = new Map<string, unknown>();
  for (const { module } of resolvedModules) {
    const api = module.api;
    if (!api) continue;
    for (const [fieldName, field] of Object.entries(api)) {
      if (!field) continue;
      registries.set(
        registryKey(module.name, fieldName),
        (field as ApiField<unknown, unknown>).createRegistry(),
      );
    }
  }
  return registries;
};

/**
 * Routes a single `(target, contribution)` pair from one module's integrations
 * into the matching target API fields, invoking `register` for each field.
 */
const applyContributionToTarget = (
  fromModule: Module,
  target: Module,
  contribution: Record<string, unknown>,
  registries: ReadonlyMap<string, unknown>,
): void => {
  const api = target.api as Record<string, ApiField<unknown, unknown>> | undefined;
  if (!api) return;
  for (const [fieldName, value] of Object.entries(contribution)) {
    const field = api[fieldName];
    const registry = registries.get(registryKey(target.name, fieldName));
    if (!field || registry === undefined) continue;
    field.register(value, registry, fromModule);
  }
};

/**
 * Applies each module's integrations against the resolved graph in topological
 * order — producers receive their contributions before any consumer below them
 * is initialised.
 */
const applyIntegrations = (
  resolved: ReadonlyArray<ResolvedModule>,
  registries: ReadonlyMap<string, unknown>,
): void => {
  const byName = new Map<string, Module>();
  resolved.forEach((entry) => byName.set(entry.module.name, entry.module));

  for (const entry of resolved) {
    const { module, missingOptionalTargets } = entry;
    const integrations = module.integrations;
    if (!integrations) continue;

    for (const [targetName, contribution] of Object.entries(integrations)) {
      if (missingOptionalTargets.has(targetName)) {
        // Soft target absent — drop silently per contract.
        continue;
      }
      const target = byName.get(targetName);
      if (!target || !contribution || typeof contribution !== 'object') continue;
      applyContributionToTarget(
        module,
        target,
        contribution as Record<string, unknown>,
        registries,
      );
    }
  }
};

/**
 * Builds a per-`ModuleProvider` registry from the given user-provided modules.
 *
 * - Always includes `CoreModule`.
 * - Builds and validates the module graph (`buildModuleGraph`).
 * - Creates a fresh registry per API field via `ApiField.createRegistry`.
 * - Applies every contribution in topological order via `ApiField.register`.
 */
export const buildModuleRegistry = (modules: ReadonlyArray<Module> = []): ModulesRegistry => {
  const resolvedModules = buildModuleGraph([CoreModule, ...modules]);
  const modulesApiRegistry = createModulesApiRegistry(resolvedModules);
  applyIntegrations(resolvedModules, modulesApiRegistry);

  const apiRegistry: ModulesApiRegistry = {
    get: (moduleName, fieldName) => modulesApiRegistry.get(registryKey(moduleName, fieldName)),
    has: (moduleName, fieldName) => modulesApiRegistry.has(registryKey(moduleName, fieldName)),
  };

  return {
    modules: resolvedModules.map((entry) => entry.module),
    apiRegistry,
  };
};
