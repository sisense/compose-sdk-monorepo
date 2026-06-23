import { ApiContract, ApiField, Module } from '@/infra/modules/types';

import { DashboardCustomization } from './types.js';

/** Name of the `dashboard` module. */
export const DASHBOARD_MODULE_NAME = 'dashboard';

/**
 * API declaration for the `dashboard` module.
 */
export interface DashboardModuleApiDefinition {
  /**
   * Registry of dashboard customization middlewares. Each contribution is applied, in registration
   * order, to the props of every {@link Dashboard}.
   */
  customizations: ApiField<DashboardCustomization[], DashboardCustomization[]>;
}

/**
 * The `dashboard` module.
 *
 * Owns the `customizations` registry — other modules contribute {@link DashboardCustomization}
 * middlewares there (via their `integrations`), which `Dashboard` applies to its props. Register it
 * on `SisenseContextProvider`'s `modules` prop together with the modules that customize dashboards.
 *
 * @example
 * ```ts
 * <SisenseContextProvider modules={[DashboardModule, ...otherModules]} ... />
 * ```
 * @sisenseInternal
 */
export const DashboardModule: Module<DashboardModuleApiDefinition> = {
  name: DASHBOARD_MODULE_NAME,
  version: __PACKAGE_VERSION__,
  api: {
    customizations: {
      createRegistry: () => [],
      register: (newCustomizations, registry) => {
        registry.push(...newCustomizations);
      },
    },
  },
};

/**
 * API contract for contributing to the `dashboard` module.
 *
 * @sisenseInternal
 */
export type DashboardModuleApi = ApiContract<DashboardModuleApiDefinition>;
