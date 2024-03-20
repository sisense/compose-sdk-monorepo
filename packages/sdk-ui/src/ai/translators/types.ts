import { MetadataItem } from '@sisense/sdk-query-client';
import { AxesMapping, NlqResponseData } from '@/ai';
import { ChartType, TableType } from '@/types';
import { WidgetModel } from '@/models';

/**
 * Expanded Query Model that is based on NlqResponseData.
 * It contains expanded JAQL and chart recommendations returned from the chat response.
 *
 * @internal
 */
export type ExpandedQueryModel = Pick<
  NlqResponseData,
  'jaql' | 'chartRecommendations' | 'queryTitle'
>;

/**
 * Expanded Query Model
 *
 * Used as a default value for ExpandedQueryModel
 *
 * @internal
 */
export const EMPTY_EXPANDED_QUERY_MODEL: ExpandedQueryModel = {
  jaql: { datasource: { title: '' }, metadata: [] },
  queryTitle: '',
  chartRecommendations: {},
};

/**
 * Simple Chart Recommendations
 *
 * @internal
 */
export interface SimpleChartRecommendations {
  chartType: string;
  dataOptions: AxesMapping;
}

/**
 * Simple Query Model that is a simplified version of ExpandedQueryModel.
 *
 * It removes any JAQL syntax or information that already exists in the schema.
 * Also, any parameters that have a default do not need to be specified.
 *
 * Users manipulates this model via the query in YAML format.
 *
 * ModelTranslator is responsible for translating this query model to SimpleWidgetModel.
 *
 * @internal
 */
export interface SimpleQueryModel {
  /**
   * The data model or perspective title.
   */
  model: string;
  metadata: MetadataItem[];
  chart: SimpleChartRecommendations | {};
  /**
   * Title of the query
   */
  queryTitle: string;
}

/**
 * Empty Simple Query Model
 *
 * Used as a default value for SimpleQueryModel
 *
 * @internal
 */
export const EMPTY_SIMPLE_QUERY_MODEL: SimpleQueryModel = {
  model: '',
  metadata: [],
  chart: {},
  queryTitle: '',
};

/**
 * All Chart Types including Table
 * Note: Table will be re-united with ChartType in a future MR
 *
 * @internal
 */
export type AllChartType = ChartType | TableType;

/**
 * Chart Widget Model
 *
 * This model serves two purposes:
 *
 * (1) For rendering a chart or table widget in the Query Composer.
 * (2) For reverse engineered (translated) to CSDK code
 *
 * Naming TBD
 *
 * @internal
 */
export type ChartWidgetModel = Pick<WidgetModel, 'getChartWidgetProps' | 'getTableWidgetProps'> & {
  chartType: AllChartType;
  queryTitle: string;
};

/**
 * UI Framework
 *
 * @internal
 */
export type UiFramework = 'react' | 'vue' | 'angular';

/**
 * Code Template Key
 *
 * @internal
 */
export type CodeTemplateKey = 'baseChartTmpl' | 'chartTmpl' | 'chartWidgetTmpl' | 'tableWidgetTmpl';

/**
 * Code Templates
 *
 * @internal
 */
export type CodeTemplates = {
  [key in UiFramework]: { [key in CodeTemplateKey]: string };
};
