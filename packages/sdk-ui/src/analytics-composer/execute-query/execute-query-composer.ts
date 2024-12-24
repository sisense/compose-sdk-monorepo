import { ExecuteQueryCodeParams, ExecutePivotQueryCodeParams } from '../types.js';
import {
  toExecuteQueryCode as importedToExecuteQueryCode,
  toExecutePivotQueryCode as importedToExecutePivotQueryCode,
} from './to-execute-query-code.js';

/**
 * Converts query params to CSDK code.
 *
 * @param queryParams - queryParams params
 * @returns CSDK code string
 */
export const toExecuteQueryCode = (executeQueryCodeParams: ExecuteQueryCodeParams): string => {
  return importedToExecuteQueryCode(executeQueryCodeParams);
};

/**
 * Converts pivot query params to CSDK code.
 *
 * @param executePivotQueryCodeParams - pivotQuery params
 * @returns CSDK code string
 */
export const toExecutePivotQueryCode = (
  executePivotQueryCodeParams: ExecutePivotQueryCodeParams,
): string => {
  return importedToExecutePivotQueryCode(executePivotQueryCodeParams);
};
