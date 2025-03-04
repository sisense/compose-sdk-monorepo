import { WidgetProps, ChartWidgetProps, PivotTableWidgetProps } from '@/props';
import { ChartDataOptions, ChartStyleOptions } from '@/types';
import { ExecuteQueryParams, ExecutePivotQueryParams } from '@/query-execution';
import { MetadataItem } from '@sisense/sdk-data';
import { DynamicChartType } from '../chart-options-processor/translations/types.js';
import { AnyColumn } from '@/chart-data-options/types.js';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExtraCodeProps = {
  componentString: string;
  extraImportsString: string;
};

/** @internal */
export type KeysOfUnion<T> = T extends T ? keyof T : never;
/** @internal */
export type AllPossibleChartOptionKeys = KeysOfUnion<ChartDataOptions>;
/** @internal */
export type AxesMappingKey = Exclude<AllPossibleChartOptionKeys, 'seriesToColorMap'>;
/** @internal */
export type AxesMapping = Partial<Record<AxesMappingKey, Array<AnyColumn>>>;

/** @internal */
export interface ChartRecommendations {
  chartFamily: string;
  chartType: string;
  axesMapping: AxesMapping;
  styleOptions?: ChartStyleOptions;
}

/**
 * Expanded Query Model that is based on NlqResponseData.
 * It contains expanded JAQL and chart recommendations returned from the chat response.
 * @internal
 */
export interface ExpandedQueryModel {
  /** @internal */
  chartRecommendations: ChartRecommendations | {};
  /** @internal */
  jaql: {
    datasource: {
      id?: string;
      type?: 'elasticube' | 'live';
      title: string;
    };
    metadata: MetadataItem[];
  };
  /** @internal */
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
  styleOptions: ChartStyleOptions;
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
export type CodeTemplateKey =
  | 'baseChartTmpl'
  | 'chartTmpl'
  | 'chartWidgetTmpl'
  | 'widgetByIdTmpl'
  | 'executeQueryByWidgetIdTmpl'
  | 'executeQueryTmpl'
  | 'executePivotQueryTmpl'
  | 'pivotTableWidgetTmpl';

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
export type ClientSideWidgetCodeParams = BaseCodeConfig & {
  widgetProps: WidgetProps;
};

/**
 * By ID Widget Code Params
 * @internal
 */
export type ByIdWidgetCodeParams = WidgetCodeConfig & {
  dashboardOid: string;
  widgetOid: string;
  chartType: DynamicChartType;
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

/**
 * @internal
 */
export type ExecuteQueryCodeParams = BaseCodeConfig & {
  queryParams: ExecuteQueryParams;
};

/**
 * @internal
 */
export type ExecutePivotQueryCodeParams = BaseCodeConfig & {
  pivotQueryParams: ExecutePivotQueryParams;
};

/**
 * @internal
 */
export type ExecuteQueryCodeProps = Stringify<ExecuteQueryParams> & { extraImportsString: string };

/**
 * @internal
 */
export type ExecutePivotQueryCodeProps = Stringify<ExecutePivotQueryParams> & {
  extraImportsString: string;
};

/**
 * @internal
 */
export type ChartWidgetCodeProps = Stringify<ChartWidgetProps> & ExtraCodeProps;

/**
 * @internal
 */
export type PivotTableWidgetCodeProps = Stringify<PivotTableWidgetProps> & ExtraCodeProps;
