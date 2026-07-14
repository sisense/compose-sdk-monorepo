/**
 * @internal API Exports of the `query` module.
 *
 * Such APIs are for CSDK cross-packages usage only.
 * These APIs may change without notice and are not part of the public contract.
 */

export { queryStateReducer } from '@/domains/query-execution/hooks/shared/query-state-reducer.js';
export { useExecuteCsvQueryInternal } from '@/domains/query-execution/hooks/use-execute-csv-query/use-execute-csv-query.js';
export { useExecutePivotQueryInternal } from '@/domains/query-execution/hooks/use-execute-pivot-query/use-execute-pivot-query.js';
export {
  executeCsvQuery,
  executePivotQuery,
  executeQuery,
  executeQueryWithRowCount,
} from '@/domains/query-execution/core/execute-query.js';
