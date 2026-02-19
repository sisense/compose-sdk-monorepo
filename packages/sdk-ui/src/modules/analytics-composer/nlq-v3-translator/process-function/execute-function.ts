import { Filter, filterFactory, FilterRelations, Measure, measureFactory } from '@sisense/sdk-data';

import { isFilterElement, isFilterRelationsElement, isMeasureElement } from '../types.js';
import { FactoryFunction, ProcessedArg, QueryElement } from '../types.js';

/**
 * Safe factory function lookup helper
 */
function getFactoryFunction(
  factory: typeof measureFactory | typeof filterFactory | typeof filterFactory.logic,
  functionName: string,
): FactoryFunction {
  // Use Reflect.get for clean dynamic property access
  const fn = Reflect.get(factory, functionName);

  if (typeof fn !== 'function') {
    throw new Error(`Function "${functionName}" not found or is not a function`);
  }

  return fn as FactoryFunction;
}

/**
 * Execute measureFactory functions directly
 */
function executeMeasureFactoryFunction(functionPath: string, args: ProcessedArg[]): Measure {
  const functionName = functionPath.replace('measureFactory.', '');
  const factoryFunction = getFactoryFunction(measureFactory, functionName);
  const result = factoryFunction(...args);

  if (!isMeasureElement(result)) {
    throw new Error(`Function "${functionPath}" did not return a valid Measure`);
  }

  return result;
}

/**
 * Execute filterFactory.logic functions (and, or)
 */
function executeFilterLogicFunction(functionPath: string, args: ProcessedArg[]): FilterRelations {
  const logicFunction = functionPath.replace('filterFactory.logic.', '');
  const logicFactoryFunction = getFactoryFunction(filterFactory.logic, logicFunction);
  const result = logicFactoryFunction(...args);

  if (!isFilterRelationsElement(result)) {
    throw new Error(`Function "${functionPath}" did not return a valid FilterRelations`);
  }

  return result;
}

/**
 * Execute filterFactory functions directly, including nested logic functions
 */
function executeFilterFactoryFunction(
  functionPath: string,
  args: ProcessedArg[],
): Filter | FilterRelations {
  if (functionPath.startsWith('filterFactory.logic.')) {
    return executeFilterLogicFunction(functionPath, args);
  }

  const functionName = functionPath.replace('filterFactory.', '');
  const factoryFunction = getFactoryFunction(filterFactory, functionName);

  const result = factoryFunction(...args);

  if (!isFilterElement(result) && !isFilterRelationsElement(result)) {
    throw new Error(`Function "${functionPath}" did not return a valid Filter or FilterRelations`);
  }

  return result;
}

/**
 * Executes a factory function with validated arguments using direct factory access
 */
export function executeFunction(functionPath: string, args: ProcessedArg[]): QueryElement {
  const parts = functionPath.split('.');
  const factoryName = parts[0];

  if (factoryName === 'measureFactory') {
    return executeMeasureFactoryFunction(functionPath, args);
  } else if (factoryName === 'filterFactory') {
    return executeFilterFactoryFunction(functionPath, args);
  }

  throw new Error(
    `Unsupported factory: "${factoryName}". Supported factories: measureFactory, filterFactory`,
  );
}
