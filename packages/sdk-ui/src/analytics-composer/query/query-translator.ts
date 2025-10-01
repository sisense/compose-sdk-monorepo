import {
  ExpandedQueryModel,
  EMPTY_SIMPLE_QUERY_MODEL,
  SimpleQueryModel,
  SimpleChartRecommendations,
  ChartRecommendations,
} from '../types.js';
import YAML from 'yaml';
import {
  AggregationTypes,
  DimensionalBaseMeasure,
  MetadataItem,
  MetadataItemJaql,
  DataSourceField,
} from '@ethings-os/sdk-data';
import { capitalizeFirstLetter, sanitizeDimensionId, validateQueryModel } from '../common/utils.js';
// .js is required for lodash import
import cloneDeep from 'lodash-es/cloneDeep';
import { QUERY_TEMPLATE } from './query-templates.js';
import { populatePlaceholders } from '../code/generate-code.js';
import { deriveChartFamily } from '@/chart/helpers/derive-chart-family.js';
import { normalizeAnyColumn } from '@/chart-data-options/utils.js';

/**
 * A class that translates ExpandedQueryModel (Raw JAQL+Chart Recommendations)
 * to SimpleQueryModel (Simple JAQL+Simple Chart Options) and vice versa.
 *
 * It also provides methods to stringify query models to YAML strings
 * and parse YAML strings to query models.
 *
 * @deprecated QueryTranslator was designed for Forge, which is now discontinued. To simplify the JQL query from NLQ, use simplifyMetadataItem() instead.
 * @internal
 */
export class QueryTranslator {
  private readonly contextTitle: string;

  private readonly indexedFields: Record<string, DataSourceField> = {};

  /**
   * Constructor for QueryTranslator.
   *
   * @param contextTitle - The context title
   * @param fields - The data source fields
   */
  constructor(contextTitle: string, fields: DataSourceField[]) {
    this.contextTitle = contextTitle;
    this.indexedFields = this.indexFields(fields);
  }

  private indexFields(fields: DataSourceField[]): Record<string, DataSourceField> {
    return fields.reduce((acc, field) => {
      const key = field.id;
      acc[key] = field;
      const sanitizedKey = sanitizeDimensionId(key);
      // index also sanitizedKey (e.g., [Commerce.Date])
      // if it is different from key (e.g., [Commerce.Date (Calendar)]),
      if (key !== sanitizedKey) {
        acc[sanitizedKey] = { ...field, id: sanitizedKey };
      }
      return acc;
    }, {} as Record<string, DataSourceField>);
  }

  /**
   * Concatenates Aggregation Types.
   */
  private concatAggTypes(): string {
    const values = Object.values(AggregationTypes);
    return values.map((value) => DimensionalBaseMeasure.aggregationToJAQL(value)).join('|');
  }

  /**
   * Simplifies Aggregation Formula defined in MetadataItemJaql returned from chat response.
   *
   * @param aggFormula - The Aggregation Formula to simplify
   * @returns The equivalent measure
   * @privateRemarks
   * See unit tests for examples of aggregation formulas and their equivalent measures.
   */
  simplifyAggFormula(aggFormula: MetadataItemJaql): MetadataItemJaql {
    const { formula, context, filter } = aggFormula;

    if (!context || !formula) {
      return aggFormula;
    }

    const keys = Object.keys(context);
    // if context has multiple entries, return the original formula without simplification
    if (keys.length !== 1) {
      return aggFormula;
    }
    const key = keys[0];
    const contextValue = context[key];
    const aggTypes = this.concatAggTypes();
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(`^\\s*(${aggTypes})\\(\\[\\w+\\]\\)$`);

    const match = formula.match(regex);
    if (match && formula.includes(key)) {
      // Extracting the aggregation function from the match
      const agg = match[1];
      return {
        dim: contextValue.dim,
        agg: agg,
        title: aggFormula.title,
        filter: filter ? { ...filter } : undefined,
      };
    }
    return aggFormula;
  }

  /**
   * Simplifies MetadataItemJaql.
   *
   * @param item - The MetadataItemJaql to simplify
   * @returns The simplified MetadataItemJaql
   */
  simplifyMetadataItemJaql(item: MetadataItemJaql): MetadataItemJaql {
    // if item contains a simple aggregation formula, simplify it
    let simplifiedItem = item;

    if ('formula' in item) {
      simplifiedItem = this.simplifyAggFormula(item);
    }

    // remove table and column and datatype from simplifiedItem
    delete simplifiedItem.table;
    delete simplifiedItem.column;
    delete simplifiedItem.datatype;

    if ('context' in simplifiedItem) {
      const context = { ...simplifiedItem.context };
      Object.keys(context).forEach((key) => {
        context[key] = this.simplifyMetadataItemJaql(context[key]);
      });
      simplifiedItem.context = context;
    }
    return simplifiedItem;
  }

  /**
   * Simplify filter
   *
   * @param item - the MetadataItem
   * @return the MetadataItem with simplified filter
   */
  simplifyMetadataItemFilter(item: MetadataItem): MetadataItem {
    const simplifiedItem = item;
    if (simplifiedItem.panel !== 'scope') return simplifiedItem;

    // format can be removed completely
    delete simplifiedItem.format;

    const { jaql } = simplifiedItem;
    if (jaql.filter?.by) {
      jaql.filter.by = this.simplifyAggFormula(jaql.filter.by);
    }

    return { ...simplifiedItem, jaql };
  }

  /**
   * Simplify date and number format
   *
   * @param item - the MetadataItem
   * @return the MetadataItem with simplified format
   */
  simplifyMetadataItemFormat(item: MetadataItem): MetadataItem {
    const {
      jaql: { level },
      format: { mask } = {},
    } = item;
    if (level && mask?.[level]) {
      return { ...item, format: { mask: { [level]: mask[level] } } };
    }
    return item;
  }

  /**
   * Simplifies MetadataItem.
   *
   * @param item - The MetadataItem to simplify
   * @returns The simplified MetadataItem
   */
  simplifyMetadataItem(item: MetadataItem): MetadataItem {
    let simplifiedItem = item;
    // simplify prop panel
    if (simplifiedItem.panel && ['rows', 'columns', 'measures'].includes(simplifiedItem.panel)) {
      delete simplifiedItem.panel;
    }

    // simplify filter
    simplifiedItem = this.simplifyMetadataItemFilter(simplifiedItem);

    // simplify format
    simplifiedItem = this.simplifyMetadataItemFormat(simplifiedItem);

    const { jaql, measure, by } = simplifiedItem;
    return {
      ...simplifiedItem,
      jaql: this.simplifyMetadataItemJaql(jaql),
      by: by ? this.simplifyMetadataItemJaql(by) : undefined,
      measure: measure ? this.simplifyMetadataItemJaql(measure) : undefined,
    };
  }

  /**
   * Simplifies Chart Recommendations.
   *
   * @param chartRecommendations - The Chart Recommendations to simplify
   * @returns The simplified chart data options
   */
  simplifyChartRecommendations(
    chartRecommendations: ChartRecommendations | {},
  ): SimpleChartRecommendations | {} {
    if (!('axesMapping' in chartRecommendations)) {
      return {};
    }

    const { chartType, axesMapping, styleOptions } = chartRecommendations;

    const dataOptions = Object.entries(axesMapping).reduce((acc, [key, items]) => {
      acc[key] = items.map((item) => normalizeAnyColumn(item));
      return acc;
    }, {});

    // Remove chartFamily from chartRecommendations and rename axesMapping to dataOptions
    return { chartType, dataOptions, styleOptions };
  }

  /**
   * Returns the query title with the chart type.
   *
   * @param queryTitle - The query title
   * @param chartRecommendations - The chart recommendations
   * @returns The query title with the chart type
   */
  getQueryTitleWithChartType(
    queryTitle: string,
    chartRecommendations: {} | ChartRecommendations,
  ): string {
    let chartTypeKeyword =
      'chartType' in chartRecommendations ? chartRecommendations.chartType : 'table';
    if (chartTypeKeyword !== 'table') {
      chartTypeKeyword += ' chart';
    }

    return `${chartTypeKeyword} showing ${queryTitle.toLowerCase()}`;
  }

  /**
   * Takes a ExpandedQueryModel (e.g., from chat response) and translates it to SimpleQueryModel.
   *
   * @param expandedQueryModel - The Expanded Query model to simplify
   * @returns The simplified query model
   */
  translateToSimple(expandedQueryModel: ExpandedQueryModel): SimpleQueryModel {
    try {
      // work with a deep copy of the query model to avoid mutation
      const { jaql, chartRecommendations, queryTitle } = cloneDeep(expandedQueryModel);

      return {
        model: jaql.datasource.title,
        metadata: jaql.metadata.map((item) => this.simplifyMetadataItem(item)),
        chart: this.simplifyChartRecommendations(chartRecommendations),
        queryTitle: this.getQueryTitleWithChartType(queryTitle, chartRecommendations),
      };
    } catch (e) {
      // TODO implement error handling
      console.error('Error running toSimpleQuery', e);
      return EMPTY_SIMPLE_QUERY_MODEL;
    }
  }

  /**
   * Stringifies a simple query model to YAML string.
   *
   * @param simpleQueryModel - The Simple Query model to convert
   * @returns The YAML string representing the simple query model
   */
  stringifySimple(simpleQueryModel: SimpleQueryModel): string {
    const { queryTitle, ...queryBody } = simpleQueryModel;
    const doc = new YAML.Document(queryBody);
    // set query title as comment before the query
    doc.commentBefore = ` ${capitalizeFirstLetter(queryTitle)}`;
    // set docStart to use '---' as the start of the doc after the query title, instead of a blank line
    if (doc.directives) doc.directives.docStart = true;
    return String(doc);
  }

  /**
   * Returns the query template.
   */
  getQueryTemplate(): string {
    return populatePlaceholders(QUERY_TEMPLATE, { dataSourceTitle: this.contextTitle });
  }

  /**
   * Parses a YAML string to Simple Query Model.
   *
   * @param simpleQueryYaml - The YAML string to parse
   * @returns The Simple Query Model
   */
  parseSimple(simpleQueryYaml: string): SimpleQueryModel {
    try {
      const doc = YAML.parseDocument(simpleQueryYaml);
      const { commentBefore } = doc;
      const queryModel = validateQueryModel(doc.toJS());
      queryModel.queryTitle = commentBefore?.trim() || '';
      return queryModel;
    } catch (e) {
      // TODO implement error handling
      console.error('Error parsing the YAML string', e);
    }

    return EMPTY_SIMPLE_QUERY_MODEL;
  }

  /**
   * Expands Chart Recommendations.
   *
   * @param chartRecommendations - The Chart Recommendations to expand
   * @returns The expanded chart recommendations
   */
  expandChartRecommendations(
    chartRecommendations: SimpleChartRecommendations | {},
  ): ChartRecommendations | {} {
    if (!chartRecommendations || !('dataOptions' in chartRecommendations)) {
      return {};
    }

    const { chartType, dataOptions: axesMapping, styleOptions } = chartRecommendations;
    const chartFamily = deriveChartFamily(chartType);

    // Add back chartFamily
    return { chartFamily, chartType, axesMapping, styleOptions };
  }

  /**
   * Expands MetadataItemJaql by adding table, column, datatype, and title
   * if they are missing from the item.
   *
   * @param item - The MetadataItemJaql to expand
   * @returns The expanded MetadataItemJaql
   */
  expandMetadataItemJaql(item: MetadataItemJaql): MetadataItemJaql {
    const { dim = '', agg, context } = item;

    // expand context if exists
    if (context) {
      Object.keys(context).forEach((key) => {
        context[key] = this.expandMetadataItemJaql(context[key]);
      });
      item.context = context;
    }

    const field = this.indexedFields[dim];
    if (!field) {
      return item;
    }

    let { filter } = item;
    if (filter?.by) {
      filter = { ...filter, by: this.expandMetadataItemJaql(filter.by) };
      item.filter = filter;
    }

    return {
      table: field.table,
      column: field.column,
      datatype: field.dimtype,
      title: agg ? agg + ' ' + field.title : field.title,
      ...item,
    };
  }

  /**
   * Expands MetadataItem
   *
   * @param item - The MetadataItem to expand
   * @returns The expanded MetadataItem
   */
  expandMetadataItem(item: MetadataItem): MetadataItem {
    const { jaql, measure } = item;

    if (measure) {
      return {
        ...item,
        jaql: this.expandMetadataItemJaql(jaql),
        measure: this.expandMetadataItemJaql(measure),
      };
    }

    return {
      ...item,
      jaql: this.expandMetadataItemJaql(jaql),
    };
  }

  /**
   * Translates a Simple Query Model to Expanded Query Model.
   *
   * @param simpleQueryModel - The Simple Query model to convert
   * @returns The Expanded Query Model
   */
  translateToExpanded(simpleQueryModel: SimpleQueryModel): ExpandedQueryModel {
    // work with a deep copy of the query model to avoid mutation
    const { model, metadata, chart, queryTitle } = cloneDeep(simpleQueryModel);
    const jaql = {
      datasource: { title: model },
      metadata: metadata.map((item) => this.expandMetadataItem(item)),
    };
    const chartRecommendations = this.expandChartRecommendations(chart);
    return { jaql, chartRecommendations, queryTitle };
  }
}
