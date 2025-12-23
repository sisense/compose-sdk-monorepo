import { DataSource } from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';

import { getTranslatedDataOptions } from '@/chart-data-options/get-translated-data-options';
import { translateTableDataOptions } from '@/chart-data-options/translate-data-options';
import { TableDataOptions } from '@/chart-data-options/types';
import { isTable } from '@/chart-options-processor/translations/types';
import { ChartWidgetProps, WidgetProps } from '@/props';
import { getTableAttributesAndMeasures } from '@/table/hooks/use-table-data';
import { isChartWidgetProps } from '@/widget-by-id/utils.js';

import { GetNlgInsightsResponse } from './api/types.js';
import { UseGetNlgInsightsParams } from './use-get-nlg-insights.js';
import { prepareGetNlgInsightsPayload } from './use-get-nlg-insights.js';

/**
 * Converts TableDataOptions to attributes and measures by translating and extracting them.
 *
 * @param dataOptions - TableDataOptions to convert
 * @returns Object containing attributes and measures extracted from table columns
 * @internal
 */
function getTranslatedTableDataOptions(dataOptions: TableDataOptions) {
  const translatedDataOptions = translateTableDataOptions(dataOptions);
  const { attributes, measures } = getTableAttributesAndMeasures(translatedDataOptions);

  return { attributes, measures };
}

/**
 * Converts ChartWidgetProps to UseGetNlgInsightsParams by extracting dimensions and measures
 * from the chart data options.
 *
 * @param props - ChartWidgetProps to convert
 * @param defaultDataSource - Optional default data source to use if props.dataSource is undefined
 * @param verbosity - Optional verbosity level for NLG insights
 * @returns UseGetNlgInsightsParams ready for use with prepareGetNlgInsightsPayload
 * @internal
 */
function convertChartWidgetPropsToUseGetNlgInsightsParams(
  props: ChartWidgetProps,
  defaultDataSource?: DataSource,
  verbosity?: 'Low' | 'High',
): UseGetNlgInsightsParams {
  const { dataSource, dataOptions, chartType, filters } = props;
  const resolvedDataSource = dataSource ?? defaultDataSource;

  if (!resolvedDataSource) {
    throw new Error(
      'dataSource is required. Provide it in ChartWidgetProps or as defaultDataSource parameter.',
    );
  }

  const { attributes, measures } = isTable(chartType)
    ? getTranslatedTableDataOptions(dataOptions as TableDataOptions)
    : getTranslatedDataOptions(dataOptions, chartType);

  return {
    dataSource: resolvedDataSource,
    dimensions: attributes,
    measures,
    filters,
    verbosity,
  };
}

/**
 * Options for {@link getNlgInsightsFromWidget} function.
 * @internal
 */
export interface GetNlgInsightsFromWidgetOptions {
  /** Optional default data source to use if WidgetProps.dataSource is undefined */
  defaultDataSource?: DataSource;
  /** The verbosity of the NLG summarization */
  verbosity?: 'Low' | 'High';
}

/**
 * Pure function that fetches NLG insights from WidgetProps.
 *
 * This function converts WidgetProps to the required API format and makes an HTTP request
 * to get natural language insights about the chart data.
 *
 * @param props - WidgetProps containing chart configuration
 * @param httpClient - HttpClient instance for making API requests
 * @param options - Optional configuration including defaultDataSource and verbosity
 * @returns Promise that resolves to the NLG insights answer string
 * @throws Error if dataSource cannot be resolved or if API response is invalid
 *
 * @example
 * ```typescript
 * import { getNlgInsightsFromWidget } from '@sisense/sdk-ui/ai';
 * import { HttpClient } from '@sisense/sdk-rest-client';
 *
 * const widgetProps: WidgetProps = {
 *   chartType: 'bar',
 *   dataOptions: { category: [...], value: [...] },
 *   dataSource: 'Sample ECommerce',
 *   filters: [...],
 * };
 *
 * const httpClient = new HttpClient(url, auth, env);
 *
 * const insights = await getNlgInsightsFromWidget(widgetProps, httpClient, {
 *   verbosity: 'High',
 * });
 * ```
 * @internal
 */
export async function getNlgInsightsFromWidget(
  props: WidgetProps,
  httpClient: HttpClient,
  options?: GetNlgInsightsFromWidgetOptions,
): Promise<string> {
  if (!isChartWidgetProps(props)) {
    throw new Error('Only ChartWidgetProps are supported for now');
  }

  const params = convertChartWidgetPropsToUseGetNlgInsightsParams(
    props,
    options?.defaultDataSource,
    options?.verbosity,
  );

  const request = prepareGetNlgInsightsPayload(params);

  const response = await httpClient.post<GetNlgInsightsResponse>(
    'api/v2/ai/nlg/queryResult',
    request,
  );

  if (!response?.data?.answer) {
    throw new Error('Invalid response from NLG insights API');
  }

  return response.data.answer;
}
