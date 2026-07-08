/**
 * Producer-side declaration of a single API field on a module.
 */
export interface ApiField<TValue, TRegistry> {
  /** Creates the per-registration registry holding contributions for this field. */
  createRegistry: () => TRegistry;
  /** Writes a contribution into the registry. Invoked once per contributor. */
  register: (value: TValue, registry: TRegistry, fromModule: Module) => void;
}

/**
 * The shape of a producer module's `api` property — a record of `ApiField` declarations.
 * Each module declares its own concrete schema (e.g. `CoreModuleApiDefinition`);
 */
// any is required here to allow heterogeneous ApiField generics in the record;
// concrete modules use their own schema type instead.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiSchema = Record<string, ApiField<any, any>>;

/**
 * A module definition which represents a named, versioned unit of Compose SDK functionality which could be consumed separately.
 *
 * A module can require other modules (`requires`), include other modules (`includes`),
 * contribute to the API of the modules it requires (`integrations`), and declare its own
 * API for other modules to contribute to (`api`).
 *
 * @example
 * A module that contributes a customization to the built-in `dashboard` module:
 * ```ts
 * const dashboardBadgeModule: Module = {
 *   name: 'dashboard-badge',
 *   version: '1.0.0',
 *   requires: ['dashboard'],
 *   integrations: {
 *     dashboard: { customizations: [addBadgeToDashboardHeader] },
 *   },
 * };
 * ```
 * @beta
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Module<TSchema = any> {
  /** Unique module identifier, e.g. `'dashboard'`. */
  name: string;
  /** Semver version of the module (e.g. `'1.0.0'`), validated against `requiredVersion` constraints declared by other modules. */
  version: string;
  /**
   * Modules this module integrates with.
   * - `'name'` → hard requirement.
   * - `{ name }` → hard requirement.
   * - `{ name, optional: true }` → soft; contributions to it are dropped if absent.
   * - `{ ..., requiredVersion: '^2.0.0' }` → optional semver range constraint.
   */
  requires?: ReadonlyArray<ModuleRequirement>;
  /** Modules this one ships as part of its own feature. */
  includes?: ReadonlyArray<Module>;
  /**
   * Declarative contributions to other modules, keyed by target module name.
   *
   * Every target must be declared in {@link requires}; contributions to
   * undeclared modules throw at startup.
   */
  integrations?: Record<string, unknown>;
  /** Producer-side API declaration; defines registries other modules contribute to. */
  api?: TSchema;
}

/**
 * Hard or soft requirement on another module, optionally version-constrained.
 *
 * @beta
 */
export type ModuleRequirement =
  | string
  | {
      name: string;
      /** If true, the requirement may be missing and contributions to it are dropped. */
      optional?: boolean;
      /**
       * Semver range the registered target's `version` must satisfy
       * (e.g. `'^2.0.0'`). Mismatches throw at boot unless `optional`.
       */
      requiredVersion?: string;
    };

/**
 * Resolves the registry type owned by a producer module's API field — the
 * value `useModuleApiRegistry(module, field)` returns.
 */
export type RegistryOf<TSchema, K extends keyof TSchema> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema[K] extends ApiField<any, infer R> ? R : never;

/**
 * Resolves the contribution value type a consumer must supply for a producer's API field.
 */
export type ValueOf<TSchema, K extends keyof TSchema> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSchema[K] extends ApiField<infer V, any> ? V : never;

/**
 * Derives the consumer-facing `*ModuleApi` contract from a producer schema.
 * Each field becomes optional and typed as its contribution value.
 *
 * @example
 * ```ts
 * export type CoreModuleApi = ApiContract<CoreModuleApiDefinition>;
 * // → { providers?: ComponentType<{ children: ReactNode }>[] }
 * ```
 * @alpha
 */
export type ApiContract<TSchema> = {
  [K in keyof TSchema]?: ValueOf<TSchema, K>;
};
