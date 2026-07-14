import { Module } from '@/infra/modules/types';

/**
 * Name of the `query` module.
 *
 * @alpha
 */
export const QUERY_MODULE_NAME = 'query';

/**
 * The `query` module.
 *
 * Contains all query-sending functionality: {@link useExecuteQuery}, {@link useExecuteCsvQuery},
 * {@link useExecutePivotQuery}, {@link useQueryCache} and the {@link ExecuteQuery} component.
 * Declares no module API and no dependencies on other modules. Register it on
 * `SisenseContextProvider`'s `modules` prop when composing an app from module sub-bundles.
 *
 * @example
 * ```ts
 * <SisenseContextProvider modules={[QueryModule]} ... />
 * ```
 * @alpha
 */
export const QueryModule: Module = {
  name: QUERY_MODULE_NAME,
  version: __PACKAGE_VERSION__,
};
