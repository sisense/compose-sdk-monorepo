/* eslint-disable sonarjs/no-duplicate-string */

/**
 * Comprehensive schema definitions for validating arguments to measureFactory and filterFactory functions.
 */
import { ArgSchema } from '../types';

// Function schema registry mapping function paths to their argument schemas
export const FACTORY_FUNCTION_SCHEMAS: Record<string, ArgSchema[]> = {
  // ==================== MEASURE FACTORY FUNCTIONS ====================

  // Basic aggregations
  'measureFactory.sum': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.average': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.avg': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.min': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.max': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.median': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.count': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.countDistinct': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.aggregate': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true }, // aggregationType
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],

  // Constants and formulas
  'measureFactory.constant': [{ type: 'number', required: true }],
  'measureFactory.customFormula': [
    { type: 'string', required: true }, // title
    { type: 'string', required: true }, // formula
    { type: 'CustomFormulaContext', required: true }, // context
  ],

  // Arithmetic operations
  'measureFactory.add': [
    { type: 'Measure | number', required: true },
    { type: 'Measure | number', required: true },
    { type: 'string', required: false }, // name
    { type: 'boolean', required: false }, // withParentheses
  ],
  'measureFactory.subtract': [
    { type: 'Measure | number', required: true },
    { type: 'Measure | number', required: true },
    { type: 'string', required: false }, // name
    { type: 'boolean', required: false }, // withParentheses
  ],
  'measureFactory.multiply': [
    { type: 'Measure | number', required: true },
    { type: 'Measure | number', required: true },
    { type: 'string', required: false }, // name
    { type: 'boolean', required: false }, // withParentheses
  ],
  'measureFactory.divide': [
    { type: 'Measure | number', required: true },
    { type: 'Measure | number', required: true },
    { type: 'string', required: false }, // name
    { type: 'boolean', required: false }, // withParentheses
  ],

  // Advanced analytics
  'measureFactory.measuredValue': [
    { type: 'Measure', required: true },
    { type: 'Filter[]', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // format
  ],
  'measureFactory.rank': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
    { type: 'string', required: false }, // sort
    { type: 'string', required: false }, // rankType
    { type: 'Attribute[]', required: false }, // groupBy
  ],
  'measureFactory.trend': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
    { type: 'any', required: false }, // options
  ],
  'measureFactory.forecast': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
    { type: 'any', required: false }, // options
  ],

  // Time-based aggregations
  'measureFactory.yearToDateSum': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.quarterToDateSum': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.monthToDateSum': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.weekToDateSum': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.runningSum': [
    { type: 'Measure', required: true },
    { type: 'boolean', required: false }, // continuous
    { type: 'string', required: false }, // name
  ],

  // Growth and difference calculations
  'measureFactory.growth': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.growthRate': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.growthPastWeek': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.growthPastMonth': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.growthPastQuarter': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.growthPastYear': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.difference': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.diffPastWeek': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.diffPastMonth': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.diffPastQuarter': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.diffPastYear': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],

  // Past period measures
  'measureFactory.pastDay': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.pastWeek': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.pastMonth': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.pastQuarter': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],
  'measureFactory.pastYear': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],

  // Statistics
  'measureFactory.contribution': [
    { type: 'Measure', required: true },
    { type: 'string', required: false }, // name
  ],

  // ==================== FILTER FACTORY FUNCTIONS ====================

  // Logical filters
  'filterFactory.union': [
    { type: 'Filter[]', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.intersection': [
    { type: 'Filter[]', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.exclude': [
    { type: 'Filter', required: true },
    { type: 'Filter', required: false }, // input filter
    { type: 'BaseFilterConfig', required: false },
  ],

  // Text filters
  'filterFactory.contains': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.doesntContain': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.startsWith': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.doesntStartWith': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.endsWith': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.doesntEndWith': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.like': [
    { type: 'Attribute', required: true },
    { type: 'string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.equals': [
    { type: 'Attribute', required: true },
    { type: 'string | number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.doesntEqual': [
    { type: 'Attribute', required: true },
    { type: 'string | number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],

  // Numeric filters
  'filterFactory.greaterThan': [
    { type: 'Attribute', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.greaterThanOrEqual': [
    { type: 'Attribute', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.lessThan': [
    { type: 'Attribute', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.lessThanOrEqual': [
    { type: 'Attribute', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.between': [
    { type: 'Attribute', required: true },
    { type: 'number', required: true }, // valueA
    { type: 'number', required: true }, // valueB
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.betweenNotEqual': [
    { type: 'Attribute', required: true },
    { type: 'number', required: true }, // valueA
    { type: 'number', required: true }, // valueB
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.numeric': [
    { type: 'Attribute', required: true },
    { type: 'string', required: false }, // operatorA
    { type: 'number', required: false }, // valueA
    { type: 'string', required: false }, // operatorB
    { type: 'number', required: false }, // valueB
    { type: 'BaseFilterConfig', required: false },
  ],

  // Member filters
  'filterFactory.members': [
    { type: 'Attribute', required: true },
    { type: 'string[]', required: true },
    { type: 'MembersFilterConfig', required: false },
  ],

  // Date filters
  'filterFactory.dateFrom': [
    { type: 'LevelAttribute', required: true },
    { type: 'Date | string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.dateTo': [
    { type: 'LevelAttribute', required: true },
    { type: 'Date | string', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.dateRange': [
    { type: 'LevelAttribute', required: true },
    { type: 'Date | string', required: true }, // from
    { type: 'Date | string', required: true }, // to
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.dateRelative': [
    { type: 'LevelAttribute', required: true },
    { type: 'number', required: true }, // offset
    { type: 'string', required: true }, // anchor
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.dateRelativeFrom': [
    { type: 'LevelAttribute', required: true },
    { type: 'number', required: true }, // offset
    { type: 'string', required: true }, // anchor
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.dateRelativeTo': [
    { type: 'LevelAttribute', required: true },
    { type: 'number', required: true }, // offset
    { type: 'string', required: true }, // anchor
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.thisYear': [
    { type: 'DateDimension', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.thisMonth': [
    { type: 'DateDimension', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.thisQuarter': [
    { type: 'DateDimension', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.today': [
    { type: 'DateDimension', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],

  // Measure filters
  'filterFactory.measureEquals': [
    { type: 'BaseMeasure', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.measureGreaterThan': [
    { type: 'BaseMeasure', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.measureGreaterThanOrEqual': [
    { type: 'BaseMeasure', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.measureLessThan': [
    { type: 'BaseMeasure', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.measureLessThanOrEqual': [
    { type: 'BaseMeasure', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.measureBetween': [
    { type: 'BaseMeasure', required: true },
    { type: 'number', required: true }, // valueA
    { type: 'number', required: true }, // valueB
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.measureBetweenNotEqual': [
    { type: 'BaseMeasure', required: true },
    { type: 'number', required: true }, // valueA
    { type: 'number', required: true }, // valueB
    { type: 'BaseFilterConfig', required: false },
  ],

  // Ranking filters
  'filterFactory.topRanking': [
    { type: 'Attribute', required: true },
    { type: 'Measure', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],
  'filterFactory.bottomRanking': [
    { type: 'Attribute', required: true },
    { type: 'Measure', required: true },
    { type: 'number', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],

  // Advanced filters
  'filterFactory.cascading': [
    { type: 'Filter[]', required: true },
    { type: 'BaseFilterConfig', required: false },
  ],

  // Logic functions
  'filterFactory.logic.and': [
    { type: 'FilterRelationsNode', required: true },
    { type: 'FilterRelationsNode', required: true },
  ],
  'filterFactory.logic.or': [
    { type: 'FilterRelationsNode', required: true },
    { type: 'FilterRelationsNode', required: true },
  ],
};

/**
 * Utility functions for working with function schemas
 */

/**
 * Get the schema for a specific function path
 */
export function getFunctionSchema(functionPath: string): ArgSchema[] | undefined {
  return FACTORY_FUNCTION_SCHEMAS[`${functionPath}`];
}

/**
 * Get required argument count for a function
 */
export function getRequiredArgCount(functionPath: string): number {
  const schema = getFunctionSchema(functionPath);
  return schema ? schema.filter((arg) => arg.required).length : 0;
}

/**
 * Get maximum argument count for a function
 */
export function getMaxArgCount(functionPath: string): number {
  const schema = getFunctionSchema(functionPath);
  return schema ? schema.length : 0;
}
