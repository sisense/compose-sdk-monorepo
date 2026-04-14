import { HttpClient } from '@sisense/sdk-rest-client';

import { prepareGetNlgInsightsPayload } from '@/domains/narrative/core/build-narrative-request.js';
import type { WidgetNarrativeNlgOptions } from '@/domains/narrative/core/widget-narrative-options.js';
import {
  convertChartWidgetPropsToUseGetNlgInsightsParams,
  convertPivotWidgetPropsToNarrativeRequest,
} from '@/domains/narrative/core/widget-props-to-narrative-params.js';
import {
  isChartWidgetProps,
  isPivotTableWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { getNarrative } from '@/infra/api/narrative/narrative-endpoints.js';

/**
 * Options for {@link getNlgInsightsFromWidget} function.
 *
 * @internal
 */
export type GetNlgInsightsFromWidgetOptions = WidgetNarrativeNlgOptions;

/**
 * Pure function that fetches NLG insights from WidgetProps.
 *
 * This function converts WidgetProps to the required API format and makes an HTTP request
 * to get natural language insights about the chart or pivot data.
 *
 * @param props - WidgetProps containing chart or pivot configuration
 * @param httpClient - HttpClient instance for making API requests
 * @param options - Optional configuration including defaultDataSource and verbosity
 * @returns Promise that resolves to the NLG insights answer string
 * @throws Error if dataSource cannot be resolved or if API response is invalid
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
  const request = isPivotTableWidgetProps(props)
    ? convertPivotWidgetPropsToNarrativeRequest(
        props,
        options?.defaultDataSource,
        options?.verbosity,
        options?.ignoreTrendAndForecast,
      )
    : isChartWidgetProps(props)
    ? prepareGetNlgInsightsPayload(
        convertChartWidgetPropsToUseGetNlgInsightsParams(
          props,
          options?.defaultDataSource,
          options?.verbosity,
          options?.ignoreTrendAndForecast,
        ),
      )
    : null;

  if (!request) {
    throw new Error('Only chart or pivot widget props are supported');
  }
  const response = await getNarrative(httpClient, request, {
    isUnifiedNarrationEnabled: options?.isUnifiedNarrationEnabled,
    isSisenseAiEnabled: options?.isSisenseAiEnabled,
  });

  if (!response?.data?.answer) {
    throw new Error('Invalid response from NLG insights API');
  }

  return response.data.answer;
}
