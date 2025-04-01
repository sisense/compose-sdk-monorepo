import { useEffect, useState, useMemo } from 'react';
import { ChartWidget } from '@/widgets/chart-widget';
import { widgetComposer } from '@/analytics-composer';
import { ChartInsights } from '@/ai/chart/chart-insights';
import { Filter, Data, MetadataItem, FilterRelations } from '@sisense/sdk-data';
import type { GetNlgInsightsRequest, NlqResponseData } from '@/ai';
import { isChartWidgetProps } from '@/widget-by-id/utils';
import { useGetNlgInsightsInternal } from '@/ai/use-get-nlg-insights';
import LoadingDotsIcon from '@/ai/icons/loading-dots-icon';
import { useCommonFilters } from '@/common-filters/use-common-filters';
import { WidgetProps } from '@/props';
import { getFiltersArray } from '@/utils/filter-relations';
import upperFirst from 'lodash-es/upperFirst';
import merge from 'ts-deepmerge';
import { NlqChartWidgetStyleOptions } from '@/types';

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
  filters?: Filter[] | FilterRelations;

  /**
   * A callback that allows to modify data immediately after it has been retrieved.
   * Can be used to inject modification of queried data.
   */
  onDataReady?: (data: Data) => Data;

  /**
   * Boolean flag to show or hide the widget header
   *
   * Note: set to 'false' to hide the widget header
   *
   * @default true
   */

  styleOptions?: NlqChartWidgetStyleOptions;
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
export const NlqChartWidget = ({
  nlqResponse,
  onDataReady,
  styleOptions,
  filters = [],
}: NlqChartWidgetProps) => {
  nlqResponse.queryTitle = upperFirst(nlqResponse.queryTitle);

  const { connectToWidgetProps } = useCommonFilters({
    initialFilters: filters,
  });
  const [chartWidgetProps, setChartWidgetProps] = useState<WidgetProps | null>(null);

  useEffect(() => {
    const widgetProps = widgetComposer.toWidgetProps(nlqResponse, {
      useCustomizedStyleOptions: true,
    });
    if (!widgetProps) setChartWidgetProps(null);
    else {
      if (styleOptions && widgetProps.styleOptions) {
        widgetProps.styleOptions = merge(widgetProps.styleOptions, styleOptions);
      }

      const connectedProps = connectToWidgetProps(widgetProps, {
        shouldAffectFilters: false,
        applyMode: 'filter',
      });

      setChartWidgetProps(connectedProps);
    }
  }, [nlqResponse, connectToWidgetProps, styleOptions]);

  const nlqResponseWithFilters: GetNlgInsightsRequest = useMemo(() => {
    const filters =
      chartWidgetProps && isChartWidgetProps(chartWidgetProps)
        ? getFiltersArray(chartWidgetProps?.filters)
        : [];

    const metadata = nlqResponse.jaql.metadata
      .filter((meta) => !meta.jaql.filter)
      .concat(
        filters
          .filter((filter) => !filter.config.disabled)
          .map((filter) => filter.jaql() as MetadataItem),
      );

    return { ...nlqResponse, jaql: { ...nlqResponse.jaql, metadata }, verbosity: 'Low' };
  }, [nlqResponse, chartWidgetProps]);

  const { data: summary, isLoading, isError } = useGetNlgInsightsInternal(nlqResponseWithFilters);

  if (isLoading || !chartWidgetProps) {
    return <LoadingDotsIcon />;
  }

  if (!isChartWidgetProps(chartWidgetProps)) {
    return <></>;
  }

  return (
    <ChartWidget
      {...chartWidgetProps}
      highlightSelectionDisabled={true}
      onDataReady={onDataReady}
      topSlot={
        summary &&
        !isError && (
          <ChartInsights nlgRequest={nlqResponseWithFilters} summary={summary}></ChartInsights>
        )
      }
    ></ChartWidget>
  );
};
