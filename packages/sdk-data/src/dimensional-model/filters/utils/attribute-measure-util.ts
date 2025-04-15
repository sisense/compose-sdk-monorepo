import {
  createAttributeHelper,
  createCalculatedMeasureHelper,
  createMeasureHelper,
  getGranularityFromJaql,
} from '../../../utils.js';
import { Attribute, BaseMeasure, CalculatedMeasure, LevelAttribute } from '../../interfaces.js';
import { FilterJaql } from '../../types.js';
import { CustomFormulaJaql, FilterJaqlInternal, RankingFilterJaql } from './types.js';

/**
 * Creates an attribute or level attribute from the provided filter JAQL object
 *
 * @param jaql - Filter JAQL object
 * @returns attribute or level attribute
 */
export const createAttributeFromFilterJaql = (
  jaql: FilterJaql | FilterJaqlInternal,
): Attribute | LevelAttribute => {
  const { dim, table, column, datatype, title, datasource: dataSource } = jaql;
  return createAttributeHelper({
    dim,
    table,
    column,
    dataType: datatype,
    granularity: getGranularityFromJaql(jaql),
    format: undefined,
    sort: undefined,
    title,
    dataSource,
  });
};

/**
 * Creates a measure from the provided filter JAQL object
 *
 * @param jaql - Filter JAQL object
 * @returns Measure
 */
export const createMeasureFromFilterJaql = (jaql: FilterJaqlInternal): BaseMeasure | undefined => {
  const { dim, table, column, title, datatype: dataType, agg, datasource: dataSource } = jaql;
  if (!agg) return undefined;
  return createMeasureHelper({
    dim,
    table,
    column,
    dataType,
    agg,
    granularity: getGranularityFromJaql(jaql),
    format: undefined,
    sort: undefined,
    title,
    dataSource,
  });
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
  if ('formula' in jaql) return createCalculatedMeasureHelper(jaql);
  const { dim, table, column, datatype: dataType, agg } = jaql as RankingFilterJaql;
  return createMeasureHelper({
    dim,
    table,
    column,
    granularity: getGranularityFromJaql(jaql),
    dataType,
    agg,
    format: undefined,
    sort: undefined,
    title: rankingMessage,
  });
};
