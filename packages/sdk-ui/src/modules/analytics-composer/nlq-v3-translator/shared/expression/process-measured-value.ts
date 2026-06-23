import {
  FunctionContext,
  isFilterRelationsElement,
  ProcessedArg,
  QueryElement,
} from '../../types.js';

const MEASURED_VALUE_FILTER_RELATIONS_ERROR =
  'FilterRelations (filterFactory.logic.or / filterFactory.logic.and) is not supported inside measureFactory.measuredValue filters. Use plain filters only, or apply logical relations at the query filter level.';

/**
 * Validates measuredValue filters: only plain Filter instances are allowed.
 * FilterRelations (logic.or / logic.and) are rejected because the JAQL engine
 * does not support them inside measured-value formulas.
 *
 * @param processedArgs - [measure, filters, name?, format?]
 * @param context - Processing context with error prefix
 * @returns Same `processedArgs` when validation succeeds
 * @throws Error when any filter entry is a FilterRelations object
 *
 * @internal
 */
export function processMeasuredValue(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): ProcessedArg[] {
  const filters = processedArgs[1];

  if (!Array.isArray(filters)) {
    return processedArgs;
  }

  filters.forEach((filter: ProcessedArg, index) => {
    if (typeof filter !== 'object' || filter === null) {
      return;
    }
    if (isFilterRelationsElement(filter as QueryElement)) {
      throw new Error(
        `${context.pathPrefix}args[1][${index}]: ${MEASURED_VALUE_FILTER_RELATIONS_ERROR}`,
      );
    }
  });

  return processedArgs;
}
