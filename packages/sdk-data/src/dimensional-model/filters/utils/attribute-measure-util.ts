import {
  DimensionalAttribute,
  DimensionalLevelAttribute,
  normalizeAttributeName,
} from '../../attributes.js';
import { Attribute, BaseMeasure, CalculatedMeasure, LevelAttribute } from '../../interfaces.js';
import { isNumber } from '../../simple-column-types.js';
import { FilterJaql, MetadataTypes } from '../../types.js';
import {
  CustomFormulaJaql,
  FilterJaqlInternal,
  JaqlDataSource,
  RankingFilterJaql,
} from './types.js';
import * as measureFactory from '../../measures/factory.js';
import { transformCustomFormulaJaql } from '../../measures/factory.js';
import { DimensionalBaseMeasure } from '../../measures/measures.js';

const DATA_MODEL_MODULE_NAME = 'DM';

/**
 * Creates an attribute or level attribute from the provided parameters
 *
 * @param dim - Dimension expression
 * @param table - Table name
 * @param column - Column name
 * @param level - Date level
 * @param dataType - Data type
 * @param title - Attribute title
 * @param dataSource - Jaql data source
 * @returns attribute or level attribute
 */
export const createAttributeHelper = (
  dim: string,
  table: string | undefined,
  column: string | undefined,
  level: string | undefined,
  dataType: string,
  title?: string,
  dataSource?: JaqlDataSource,
): Attribute | LevelAttribute => {
  // if table is undefined, extract it from dim
  const dimTable = table ?? dim.slice(1, -1).split('.')[0];
  // if column is undefined, extract it from dim
  const dimColumn = column ?? dim.slice(1, -1).split('.')[1];

  if (level) {
    const dateLevel = DimensionalLevelAttribute.translateJaqlToGranularity({ level });
    const format = DimensionalLevelAttribute.getDefaultFormatForGranularity(dateLevel);
    const levelAttribute: LevelAttribute = new DimensionalLevelAttribute(
      title ?? dimColumn,
      dim,
      dateLevel,
      format,
      undefined,
      undefined,
      dataSource,
    );
    levelAttribute.composeCode = normalizeAttributeName(
      dimTable,
      dimColumn,
      level,
      DATA_MODEL_MODULE_NAME,
    );
    return levelAttribute;
  }
  const attributeType = isNumber(dataType)
    ? MetadataTypes.NumericAttribute
    : MetadataTypes.TextAttribute;
  const attribute: Attribute = new DimensionalAttribute(
    title ?? dimColumn,
    dim,
    attributeType,
    undefined,
    undefined,
    dataSource,
  );
  attribute.composeCode = normalizeAttributeName(
    dimTable,
    dimColumn,
    undefined,
    DATA_MODEL_MODULE_NAME,
  );

  return attribute;
};

/**
 * Creates an attribute or level attribute from the provided filter JAQL object
 *
 * @param jaql - Filter JAQL object
 * @returns attribute or level attribute
 */
export const createAttributeFromFilterJaql = (
  jaql: FilterJaql | FilterJaqlInternal,
): Attribute | LevelAttribute => {
  const { dim, table, column, level, datatype, title, datasource: dataSource } = jaql;

  return createAttributeHelper(dim, table, column, level, datatype, title, dataSource);
};

/**
 * Creates a measure from the provided parameters
 *
 * @param dim - Dimension expression
 * @param table - Table name
 * @param column - Column name
 * @param level - Date level
 * @param dataType - Data type
 * @param agg - Aggregation function
 * @param title - Measure title
 * @param dataSource - data source provided in JAQL
 * @returns measure
 */
export const createMeasureHelper = (
  dim: string,
  table: string | undefined,
  column: string,
  level: string | undefined,
  dataType: string,
  agg: string,
  title?: string,
  dataSource?: JaqlDataSource,
): BaseMeasure => {
  const attribute = createAttributeHelper(dim, table, column, level, dataType, title, dataSource);
  const measure = measureFactory.aggregate(attribute, agg, title);
  measure.composeCode = `measureFactory.${agg}(${attribute.composeCode})`;
  return measure;
};

/**
 * Creates a calculated measure from the provided filter JAQL object
 *
 * @param jaql - custom formula jaql
 * @returns calculated measure
 */
export const createCalculatedMeasureFromJaql = (jaql: CustomFormulaJaql): CalculatedMeasure => {
  const measure = transformCustomFormulaJaql(jaql);
  // TBD (SNS-108945)
  // Handle preparation of 'composeCode' for formula
  measure.composeCode = `'Formula code to be implemented'`;
  return measure;
};

/**
 * Creates a measure from the provided filter JAQL object
 *
 * @param jaql - Filter JAQL object
 * @returns Measure
 */
export const createMeasureFromFilterJaql = (jaql: FilterJaqlInternal): BaseMeasure | undefined => {
  const {
    dim,
    table,
    column,
    title,
    level,
    datatype: dataType,
    agg,
    datasource: dataSource,
  } = jaql;
  if (!agg) return undefined;
  return createMeasureHelper(
    dim,
    table,
    column,
    level,
    dataType,
    DimensionalBaseMeasure.aggregationFromJAQL(agg),
    title,
    dataSource,
  );
};

/**
 * Creates a measure from the provided ranking filter JAQL object
 *
 * @param jaql - Ranking filter Jaql object
 * @returns Measure
 */
export const createMeasureFromRankingFilterJaql = (
  jaql: RankingFilterJaql | CustomFormulaJaql,
  rankingMessage?: string,
): BaseMeasure | CalculatedMeasure => {
  if ('formula' in jaql) return createCalculatedMeasureFromJaql(jaql);
  const { dim, table, column, level, datatype: dataType, agg } = jaql as RankingFilterJaql;
  return createMeasureHelper(
    dim,
    table,
    column,
    level,
    dataType,
    DimensionalBaseMeasure.aggregationFromJAQL(agg),
    rankingMessage,
  );
};
