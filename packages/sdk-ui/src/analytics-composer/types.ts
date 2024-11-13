import { WidgetProps } from '@/props';
import { ChartDataOptions } from '@/types';
import { MetadataItem } from '@sisense/sdk-data';

export type KeysOfUnion<T> = T extends T ? keyof T : never;
export type AllPossibleChartOptionKeys = KeysOfUnion<ChartDataOptions>;
export type AxesMappingKey = Exclude<AllPossibleChartOptionKeys, 'seriesToColorMap'>;
export type AxesMapping = Partial<
  Record<
    AxesMappingKey,
    Array<{
      name: string;
      type?: string;
    }>
  >
>;

export interface ChartRecommendations {
  chartFamily: string;
  chartType: string;
  axesMapping: AxesMapping;
}

/**
 * Expanded Query Model that is based on NlqResponseData.
 * It contains expanded JAQL and chart recommendations returned from the chat response.
 * @internal
 */
export interface ExpandedQueryModel {
  chartRecommendations: ChartRecommendations | {};
  jaql: {
    datasource: {
      title: string;
    };
    metadata: MetadataItem[];
  };
  queryTitle: string;
}

/**
 * Empty Expanded Query Model
 *
 * Used as a default value for ExpandedQueryModel
 * @internal
 */
export const EMPTY_EXPANDED_QUERY_MODEL: ExpandedQueryModel = {
  jaql: { datasource: { title: '' }, metadata: [] },
  queryTitle: '',
  chartRecommendations: {},
};

/**
 * Simple Chart Recommendations
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
 * QueryTranslator is responsible for translating this query model to ExpandedWidgetModel.
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
 * @internal
 */
export const EMPTY_SIMPLE_QUERY_MODEL: SimpleQueryModel = {
  model: '',
  metadata: [],
  chart: {},
  queryTitle: '',
};

/**
 * UI Framework
 * @internal
 */
export type UiFramework = 'react' | 'vue' | 'angular';

/**
 * Code Template Key
 * @internal
 */
export type CodeTemplateKey = 'baseChartTmpl' | 'chartTmpl' | 'chartWidgetTmpl' | 'widgetByIdTmpl';

/**
 * Code Templates
 * @internal
 */
export type CodeTemplates = {
  [key in UiFramework]: { [key in CodeTemplateKey]: string };
};

/**
 * Code Placeholder Map
 * @internal
 */
export type CodePlaceholderMap = Record<string, string>;

/**
 * Base Code Config
 * @internal
 */
export type BaseCodeConfig = { uiFramework?: UiFramework };

/**
 * Widget Code Config
 * @internal
 */
export type WidgetCodeConfig = BaseCodeConfig & { includeChart?: boolean };

/**
 * Client-side Widget Code Params
 * @internal
 */
export type ClientSideWidgetCodeParams = WidgetCodeConfig & {
  widgetProps: WidgetProps;
};

/**
 * By ID Widget Code Params
 * @internal
 */
export type ByIdWidgetCodeParams = WidgetCodeConfig & {
  dashboardOid: string;
  widgetOid: string;
};

/**
 * Widget Code Params
 * @internal
 */
export type WidgetCodeParams = ClientSideWidgetCodeParams | ByIdWidgetCodeParams;

/**
 * Check if widget code params is for client-side code
 * @internal
 */
export const isClientSideWidgetCodeParams = (
  params: WidgetCodeParams,
): params is ClientSideWidgetCodeParams => {
  return 'widgetProps' in params;
};

/**
 * Check if widget code params is for by ID code
 * @internal
 */
export const isByIdWidgetCodeParams = (
  params: WidgetCodeParams,
): params is ByIdWidgetCodeParams => {
  return 'dashboardOid' in params && 'widgetOid' in params;
};

/**
 * @internal
 **/
export type WidgetPropsConfig = { useCustomizedStyleOptions?: boolean };
