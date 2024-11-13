import { ChartWidget } from '@/widgets/chart-widget';
import { widgetComposer } from '@/analytics-composer';
import { ChartInsights } from '@/ai/chart/chart-insights';
import { Filter } from '@sisense/sdk-data';
import type { NlqResponseData } from '@/ai';
import { isChartWidgetProps } from '@/widget-by-id/utils';

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
export const NlqChartWidget = ({ nlqResponse, filters = [] }: NlqChartWidgetProps) => {
  const chartWidgetProps = widgetComposer.toWidgetProps(nlqResponse, {
    useCustomizedStyleOptions: true,
  });

  if (!chartWidgetProps || !isChartWidgetProps(chartWidgetProps)) {
    return <></>;
  }
  chartWidgetProps[chartWidgetProps?.chartType === 'table' ? 'filters' : 'highlights'] = filters;

  return (
    <ChartWidget
      {...chartWidgetProps}
      topSlot={<ChartInsights nlgRequest={nlqResponse}></ChartInsights>}
    ></ChartWidget>
  );
};
