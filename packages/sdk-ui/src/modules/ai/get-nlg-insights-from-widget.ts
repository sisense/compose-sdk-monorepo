import { HttpClient } from '@sisense/sdk-rest-client';

import {
  buildWidgetNarrativeRequests,
  MISSING_DATASOURCE_NLG_ERROR,
} from '@/domains/narrative/core/widget-props-to-narrative-params.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { getNarrative } from '@/infra/api/narrative/narrative-endpoints.js';

/**
 * Pure function that fetches NLG insights from WidgetProps.
 *
 * This function converts WidgetProps to the required API format and makes an HTTP request
 * to get natural language insights about the chart or pivot data.
 *
 * @param props - WidgetProps containing chart or pivot configuration (`aiOptions.narrative`
 *   drives {@link WidgetNarrativeOptions})
 * @param httpClient - HttpClient instance for making API requests
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
 * const insights = await getNlgInsightsFromWidget(widgetProps, httpClient);
 * ```
 * @internal
 */
export async function getNlgInsightsFromWidget(
  props: WidgetProps,
  httpClient: HttpClient,
): Promise<string> {
  const { supported, narrativeRequest, narrativeFallbackRequest, missingDataSource } =
    buildWidgetNarrativeRequests(props);

  if (!supported || !narrativeRequest) {
    if (missingDataSource) {
      throw new Error(MISSING_DATASOURCE_NLG_ERROR);
    }
    throw new Error('Only chart or pivot widget props are supported');
  }

  const response = await getNarrative(httpClient, narrativeRequest, {
    canGenerateNarrativeViaAI: false,
    fallbackRequestOn400: narrativeFallbackRequest,
  });

  if (!response?.data?.answer) {
    throw new Error('Invalid response from NLG insights API');
  }

  return response.data.answer;
}
