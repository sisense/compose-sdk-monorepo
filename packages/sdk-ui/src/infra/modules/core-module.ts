import type { ComponentType, ReactNode } from 'react';

import type { ApiContract, ApiField, Module } from './types.js';

type ProviderComponent = ComponentType<{ children: ReactNode }>;

/**
 * API declaration for the `core` module.
 */
export interface CoreModuleApiDefinition {
  /** Root-level React providers mounted by `SisenseContextProvider`. */
  providers: ApiField<ProviderComponent[], ProviderComponent[]>;
}

/**
 * API contract for contributing to the `core` module.
 */
export type CoreModuleApi = ApiContract<CoreModuleApiDefinition>;

export const CORE_MODULE_NAME = 'core';

/**
 * The `core` module.
 * Always registered automatically by `ModuleProvider`; consumers do not need to list it in the `modules` prop.
 *
 * Owns the `providers` registry — other modules contribute root-level React
 * providers there, which `CoreModuleProvidersTree` mounts inside `SisenseContextProvider`.
 */
export const CoreModule: Module<CoreModuleApiDefinition> = {
  name: CORE_MODULE_NAME,
  version: __PACKAGE_VERSION__,
  api: {
    providers: {
      createRegistry: () => [],
      register: (newProviders, registry) => {
        registry.push(...newProviders);
      },
    },
  },
};
