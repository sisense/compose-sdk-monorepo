/**
 * Thin entry for {@link QueryApiDispatcher} without loading {@link DimensionalQueryClient}
 * / `@sisense/sdk-pivot-query-client`.
 *
 * Prefer `@sisense/sdk-query-client/dispatcher` from Node consumers (e.g. sdk-ai-core)
 * that only need datasource list/fields/schema helpers.
 */

export { QueryApiDispatcher } from './query-api-dispatcher/query-api-dispatcher.js';
export type {
  DisplayNameConfig,
  GetDataSourceFieldsOptions,
} from './query-api-dispatcher/types.js';
