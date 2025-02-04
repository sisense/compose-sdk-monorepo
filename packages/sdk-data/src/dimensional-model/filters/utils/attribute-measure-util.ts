import { Attribute, BaseMeasure, CalculatedMeasure, LevelAttribute } from '../../interfaces.js';
import { FilterJaql } from '../../types.js';
import { CustomFormulaJaql, FilterJaqlInternal, RankingFilterJaql } from './types.js';
import {
  createAttributeHelper,
  createCalculatedMeasureHelper,
  createMeasureHelper,
} from '../../../utils.js';

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

  return createAttributeHelper({
    dim,
    table,
    column,
    dataType: datatype,
    level,
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
  return createMeasureHelper({
    dim,
    table,
    column,
    dataType,
    agg,
    level,
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
  const { dim, table, column, level, datatype: dataType, agg } = jaql as RankingFilterJaql;
  return createMeasureHelper({
    dim,
    table,
    column,
    level,
    dataType,
    agg,
    format: undefined,
    sort: undefined,
    title: rankingMessage,
  });
};
