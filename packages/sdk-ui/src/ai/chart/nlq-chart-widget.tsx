import { useEffect, useState } from 'react';
import { ChartWidget } from '@/widgets/chart-widget';
import { widgetComposer } from '@/analytics-composer';
import { ChartInsights } from '@/ai/chart/chart-insights';
import { Filter, Data } from '@sisense/sdk-data';
import type { NlqResponseData } from '@/ai';
import { isChartWidgetProps } from '@/widget-by-id/utils';
import { useGetNlgQueryResultInternal } from '@/ai/use-get-nlg-query-result';
import LoadingDotsIcon from '@/ai/icons/loading-dots-icon';
import { useTranslation } from 'react-i18next';
import { useCommonFilters } from '@/common-filters/use-common-filters';
import { WidgetProps } from '@/props';

/**
 * Props for {@link NlqChartWidget} component.
 *
 * @group Generative AI
 * @internal
 */
export interface NlqChartWidgetProps {
  /**
   * Chatbot NLQ Response
   */
  nlqResponse: NlqResponseData;

  /**
   * The dashboard filters to be applied to the chart
   */
  filters?: Filter[];

  /**
   * A callback that allows to modify data immediately after it has been retrieved.
   * Can be used to inject modification of queried data.
   */
  onDataReady?: (data: Data) => Data;
}

/**
 * React component that renders a chart widget based on NLQ response data.
 *
 * @example
 * ```tsx
 * import { NlqChartWidget, NlqResponseData } from '@sisense/sdk-ui/ai';
 * import { Filter } from '@sisense/sdk-data';
 *
 * function ExampleComponent(nlqResponse: NlqResponseData, filters?: Filter[]) {
 *
 *    return (
 *      <ChartWidgetWithInsights
 *        nlqResponse={nlqResponse}
 *        filters={filters}
 *      />
 *    );
 * }
 * ```
 * @param props - {@link NlqChartWidgetProps}
 * @group Generative AI
 * @internal
 */
export const NlqChartWidget = ({ nlqResponse, onDataReady, filters = [] }: NlqChartWidgetProps) => {
  const { t } = useTranslation();
  const { connectToWidgetProps } = useCommonFilters({ initialFilters: filters });
  const [chartWidgetProps, setChartWidgetProps] = useState<WidgetProps | null>(null);

  useEffect(() => {
    const w = widgetComposer.toWidgetProps(nlqResponse, {
      useCustomizedStyleOptions: true,
    });
    if (!w) setChartWidgetProps(null);
    else setChartWidgetProps(connectToWidgetProps(w));
  }, [nlqResponse, connectToWidgetProps]);

  const { data, isLoading, isError } = useGetNlgQueryResultInternal(nlqResponse);

  if (isLoading || !chartWidgetProps) {
    return <LoadingDotsIcon />;
  }

  if (!isChartWidgetProps(chartWidgetProps)) {
    return <></>;
  }

  const summary = data ?? t('ai.errors.insightsNotAvailable');

  return (
    <ChartWidget
      {...chartWidgetProps}
      onDataReady={onDataReady}
      topSlot={
        isError ? (
          t('ai.errors.unexpected')
        ) : (
          <ChartInsights nlgRequest={nlqResponse} summary={summary}></ChartInsights>
        )
      }
    ></ChartWidget>
  );
};
