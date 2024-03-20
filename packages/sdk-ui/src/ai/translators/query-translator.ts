/* eslint-disable max-lines */
import {
  ExpandedQueryModel,
  EMPTY_SIMPLE_QUERY_MODEL,
  SimpleQueryModel,
  SimpleChartRecommendations,
} from '@/ai/translators/types';
import YAML from 'yaml';
import { DataSourceField, MetadataItem, MetadataItemJaql } from '@sisense/sdk-query-client';
import { ChartRecommendations } from '@/ai';
import { AggregationTypes } from '@sisense/sdk-data';
import {
  isCartesian,
  isCategorical,
  isScatter,
} from '@/chart-options-processor/translations/types';
import { ChartType } from '@/types';

/**
 * A class that translates ExpandedQueryModel (Raw JAQL+Chart Recommendations)
 * to SimpleQueryModel (Simple JAQL+Simple Chart Options) and vice versa.
 *
 * It also provides methods to stringify query models to YAML strings
 * and parse YAML strings to query models.
 *
 * @internal
 */
export class QueryTranslator {
  private readonly contextTitle: string;

  private indexedFields: Record<string, DataSourceField> = {};

  /**
   * Constructor for QueryTranslator.
   *
   * @param contextTitle - The context title
   * @param fields - The data source fields
   */
  constructor(contextTitle: string, fields: DataSourceField[]) {
    this.contextTitle = contextTitle;

    console.log('QueryTranslator', fields);

    this.indexedFields = fields.reduce((acc, field) => {
      acc[field.id] = field;
      return acc;
    }, {} as Record<string, DataSourceField>);
  }

  /**
   * Concatenates Aggregation Types.
   */
  private concatAggTypes(): string {
    const values = Object.values(AggregationTypes);
    return values.join('|');
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
    const { formula, context } = aggFormula;

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
    const regex = new RegExp(`^(${aggTypes})\\(\\[\\w+\\]\\)$`);

    const match = formula.match(regex);
    if (match && formula.includes(key)) {
      // Extracting the aggregation function from the match
      const agg = match[1];
      return {
        dim: contextValue.dim,
        agg: agg,
        title: aggFormula.title,
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
    let { ...simplifiedItem } = item;
    if ('formula' in item) {
      simplifiedItem = this.simplifyAggFormula(item);
    }

    // remove table and column and datatype from simplifiedItem
    delete simplifiedItem.table;
    delete simplifiedItem.column;
    delete simplifiedItem.datatype;

    // TODO simplify format for Date dimension
    // If the dimension is for filtering (panel='scope'), format can be removed completely

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
   * Simplifies MetadataItem.
   *
   * @param item - The MetadataItem to simplify
   * @returns The simplified MetadataItem
   */
  simplifyMetadataItem(item: MetadataItem): MetadataItem {
    const { ...simplifiedItem } = item;
    if (simplifiedItem.panel === 'measures' || simplifiedItem.panel === 'columns') {
      delete simplifiedItem.panel;
    }
    const { jaql, measure } = simplifiedItem;
    return {
      ...simplifiedItem,
      jaql: this.simplifyMetadataItemJaql(jaql),
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

    const { chartType, axesMapping } = chartRecommendations;

    const dataOptions = Object.entries(axesMapping).reduce((acc, [key, items]) => {
      acc[key] = items.map((item) => ({ name: item.name }));
      return acc;
    }, {});

    // Remove chartFamily from chartRecommendations and rename axesMapping to dataOptions
    return { chartType, dataOptions };
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
      const { jaql, chartRecommendations, queryTitle } = expandedQueryModel;
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
    doc.commentBefore = ` ${queryTitle}`;
    return String(doc);
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
      const queryModel = doc.toJS() as SimpleQueryModel;
      queryModel.queryTitle = commentBefore?.trim() || '';
      return queryModel;
    } catch (e) {
      // TODO implement error handling
      console.error('Error parsing the YAML string', e);
    }

    return EMPTY_SIMPLE_QUERY_MODEL;
  }

  /**
   * Derives chart family from chart type.
   *
   * @param chartType - chart type
   * @returns chart family
   */
  private deriveChartFamily = (chartType: string): string => {
    if (isCartesian(chartType as ChartType)) {
      return 'cartesian';
    }
    if (isCategorical(chartType as ChartType)) {
      return 'categorical';
    }
    if (isScatter(chartType as ChartType)) {
      return 'scatter';
    }

    return 'table';
  };

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

    const { chartType, dataOptions: axesMapping } = chartRecommendations;
    const chartFamily = this.deriveChartFamily(chartType);

    // Add back chartFamily
    return { chartFamily, chartType, axesMapping };
  }

  /**
   * Expands MetadataItemJaql by adding table, column, datatype, and title
   * if they are missing from the item.
   *
   * @param item - The MetadataItemJaql to expand
   * @returns The expanded MetadataItemJaql
   */
  expandMetadataItemJaql(item: MetadataItemJaql): MetadataItemJaql {
    const { dim = '', agg } = item;
    const field = this.indexedFields[dim];
    if (!field) {
      return item;
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
    const { model, metadata, chart, queryTitle } = simpleQueryModel;
    const jaql = {
      datasource: { title: model },
      metadata: metadata.map((item) => this.expandMetadataItem(item)),
    };
    const chartRecommendations = this.expandChartRecommendations(chart);
    return { jaql, chartRecommendations, queryTitle };
  }
}
