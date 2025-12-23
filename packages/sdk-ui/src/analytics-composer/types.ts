import { JaqlDataSourceForDto, JSONArray, JSONValue, MetadataItem } from '@sisense/sdk-data';

import { AnyColumn } from '@/chart-data-options/types.js';
import { DashboardProps } from '@/dashboard/types.js';
import { ChartWidgetProps, PivotTableWidgetProps, WidgetProps } from '@/props';
import { ExecutePivotQueryParams, ExecuteQueryParams } from '@/query-execution';
import { ChartDataOptions, ChartStyleOptions } from '@/types';

import { DynamicChartType } from '../chart-options-processor/translations/types.js';

type Stringify<T> = {
  [K in keyof T as `${K & string}String`]: string;
};

type ExtraWidgetCodeProps = {
  componentString: string;
  extraImportsString: string;
  idString?: string;
  widgetTypeString?: 'chart' | 'pivot' | 'text' | 'custom';
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
 *
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
 *
 * @internal
 */
export const EMPTY_EXPANDED_QUERY_MODEL: ExpandedQueryModel = {
  jaql: { datasource: { title: '', type: 'elasticube' }, metadata: [] },
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
export type CodeTemplateKey =
  | 'baseChartTmpl'
  | 'chartTmpl'
  | 'chartWidgetTmpl'
  | 'chartWidgetPropsTmpl'
  | 'widgetByIdTmpl'
  | 'executeQueryByWidgetIdTmpl'
  | 'executeQueryTmpl'
  | 'executePivotQueryTmpl'
  | 'pivotTableWidgetTmpl'
  | 'pivotTableWidgetPropsTmpl'
  | 'dashboardByIdTmpl'
  | 'dashboardTmpl';

/**
 * Code Templates
 *
 * @internal
 */
export type CodeTemplates = {
  [key in UiFramework]: { [key in CodeTemplateKey]: string };
};

/**
 * Code Placeholder Map
 *
 * @internal
 */
export type CodePlaceholderMap = Record<string, string>;

/**
 * Base Code Config
 *
 * @internal
 */
export type BaseCodeConfig = { uiFramework?: UiFramework };

/** TYPES FOR WIDGET CODE */

/**
 * Widget Code Config
 *
 * @internal
 */
export type WidgetCodeConfig = BaseCodeConfig & { includeChart?: boolean };

/**
 * Client-side Widget Code Params
 *
 * @internal
 */
export type ClientSideWidgetCodeParams = BaseCodeConfig & {
  widgetProps: WidgetProps;
  removeDefaultProps?: boolean;
};

/**
 * By ID Widget Code Params
 *
 * @internal
 */
export type ByIdWidgetCodeParams = WidgetCodeConfig & {
  dashboardOid: string;
  widgetOid: string;
  chartType: DynamicChartType;
};

/**
 * Widget Code Params
 *
 * @internal
 */
export type WidgetCodeParams = ClientSideWidgetCodeParams | ByIdWidgetCodeParams;

/**
 * Check if widget code params is for client-side code
 *
 * @internal
 */
export const isClientSideWidgetCodeParams = (
  params: WidgetCodeParams,
): params is ClientSideWidgetCodeParams => {
  return 'widgetProps' in params;
};

/**
 * Check if widget code params is for by ID code
 *
 * @internal
 */
export const isByIdWidgetCodeParams = (
  params: WidgetCodeParams,
): params is ByIdWidgetCodeParams => {
  return 'dashboardOid' in params && 'widgetOid' in params;
};

/**
 * Widget Props Config
 *
 * @internal
 */
export type WidgetPropsConfig = { useCustomizedStyleOptions?: boolean };

/**
 * Execute Query Code Params
 *
 * @internal
 */
export type ExecuteQueryCodeParams = BaseCodeConfig & {
  queryParams: ExecuteQueryParams;
};

/**
 * Execute Pivot Query Code Params
 *
 * @internal
 */
export type ExecutePivotQueryCodeParams = BaseCodeConfig & {
  pivotQueryParams: ExecutePivotQueryParams;
};

/**
 * Execute Query Code Props
 *
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
 * Chart Widget Code Props
 *
 * @internal
 */
export type ChartWidgetCodeProps = Stringify<ChartWidgetProps> & ExtraWidgetCodeProps;

/**
 * Pivot Table Widget Code Props
 *
 * @internal
 */
export type PivotTableWidgetCodeProps = Stringify<PivotTableWidgetProps> & ExtraWidgetCodeProps;

/**
 * Template Key by Widget Type
 *
 * @internal
 */
export type TemplateKeyMapByWidgetType = {
  chart: CodeTemplateKey;
  pivot: CodeTemplateKey;
  text?: CodeTemplateKey;
  custom?: CodeTemplateKey;
};

/** TYPE FOR DASHBOARD CODE */

/**
 * Dashboard Code Config
 *
 * @internal
 */
export type DashboardCodeConfig = BaseCodeConfig;

/**
 * Client-side Dashboard Code Params
 *
 * @internal
 */
export type ClientSideDashboardCodeParams = BaseCodeConfig & {
  dashboardProps: DashboardProps;
};

/**
 * By ID Dashboard Code Params
 *
 * @internal
 */
export type ByIdDashboardCodeParams = DashboardCodeConfig & {
  dashboardOid: string;
};

/**
 * Dashboard Code Params
 *
 * @internal
 */
export type DashboardCodeParams = ClientSideDashboardCodeParams | ByIdDashboardCodeParams;

/**
 * Check if dashboard code params is for client-side code
 *
 * @internal
 */
export const isClientSideDashboardCodeParams = (
  params: DashboardCodeParams,
): params is ClientSideDashboardCodeParams => {
  return 'dashboardProps' in params;
};

/**
 * Check if dashboard code params is for by ID code
 *
 * @internal
 */
export const isByIdDashboardCodeParams = (
  params: DashboardCodeParams,
): params is ByIdDashboardCodeParams => {
  return 'dashboardOid' in params;
};

/**
 * Dashboard Code Props
 *
 * @internal
 */
export type DashboardCodeProps = Stringify<DashboardProps> & ExtraWidgetCodeProps;

/**
 * @internal
 */
export type NormalizedColumn = {
  name: string;
  dataType: string;
  expression: string;
  description?: string;
};

/**
 * @internal
 */
export type NormalizedTable = {
  name: string;
  columns: NormalizedColumn[];
};

/**
 * NLQ generic input with context for translation
 *
 * @internal
 */
export type NlqTranslationInput<DataType, ContextType> = {
  data: DataType;
  context: ContextType;
};

/**
 * Response JSON generated by the new NLQ API.
 *
 * @internal
 */
export type NlqResponseJSON = {
  dimensions: JSONArray;
  measures: JSONArray;
  filters: JSONArray;
  highlights?: JSONArray;
};

/**
 * Data schema context for translation
 *
 * @internal
 */
export interface DataSchemaContext {
  /** The data source being used for the query */
  dataSource: JaqlDataSourceForDto;
  /** Available tables for attribute resolution */
  tables: NormalizedTable[];
}

/**
 * Query input for translation
 *
 * @internal
 */
export type QueryInput = NlqTranslationInput<NlqResponseJSON, DataSchemaContext>;

/**
 * Context information for error generation
 *
 * @internal
 */
export type NlqTranslationErrorContext = {
  /** The category of the query element that failed (dimensions, measures, filters, highlights) */
  category: 'dimensions' | 'measures' | 'filters' | 'highlights';
  /** The index of the element within its category array */
  index: number;
  /** The complete original input that caused the error */
  input: JSONValue;
};

/**
 * Structured error information for translation failures.
 *
 * @internal
 */
export type NlqTranslationError = NlqTranslationErrorContext & {
  /** Human-readable error message describing what went wrong */
  message: string;
};

/**
 * Structured error response format for translation failures.
 *
 * @internal
 */
export type NlqTranslationErrorResult = {
  success: false;
  errors: NlqTranslationError[];
};

/**
 * Success response format for translation operations.
 *
 * @internal
 */
export type NlqTranslationSuccessResult<T> = {
  success: true;
  data: T;
};
/**
 * Represents the result of a translation operation that can either succeed with data or fail with errors.
 *
 * @internal
 */
export type NlqTranslationResult<T> = NlqTranslationSuccessResult<T> | NlqTranslationErrorResult;
