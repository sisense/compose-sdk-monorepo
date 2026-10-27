/**
 * The package bundles its own copy of `@sisense/sdk-data` and checks some of its objects with
 * `instanceof`. A host that loads the package as a script builds attributes, measures and filters
 * for its components, so it needs the factories of that same copy; an app's own `@sisense/sdk-data`
 * builds objects the checks do not recognize.
 */
import {
  createAttribute as sdkDataCreateAttribute,
  createDimensionalElementFromJaql as sdkDataCreateDimensionalElementFromJaql,
  filterFactory as sdkDataFilterFactory,
} from '@sisense/sdk-data';

/**
 * `createAttribute` from the copy of `@sisense/sdk-data` that this package bundles.
 *
 * @sisenseInternal
 */
export const createAttribute = sdkDataCreateAttribute;

/**
 * `createDimensionalElementFromJaql` from the copy of `@sisense/sdk-data` that this package bundles.
 *
 * @sisenseInternal
 */
export const createDimensionalElementFromJaql = sdkDataCreateDimensionalElementFromJaql;

/**
 * `filterFactory` from the copy of `@sisense/sdk-data` that this package bundles.
 *
 * @sisenseInternal
 */
export const filterFactory = sdkDataFilterFactory;
