import { ExecuteQueryCodeParams } from '../types.js';
import { toExecuteQueryCode as importedToExecuteQueryCode } from './to-execute-query-code.js';

/**
 * Converts query params to CSDK code.
 *
 * @param queryParams - queryParams params
 * @returns CSDK code string
 */
export const toExecuteQueryCode = (executeQueryCodeParams: ExecuteQueryCodeParams): string => {
  return importedToExecuteQueryCode(executeQueryCodeParams);
};
