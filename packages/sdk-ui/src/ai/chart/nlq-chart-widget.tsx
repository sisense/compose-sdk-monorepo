import { memo, useEffect, useMemo, useState } from 'react';

import { Data, Filter, FilterRelations, MetadataItem } from '@sisense/sdk-data';
import upperFirst from 'lodash-es/upperFirst';
import merge from 'ts-deepmerge';

import type { GetNlgInsightsRequest, NlqResponseData } from '@/ai';
import { ChartInsights } from '@/ai/chart/chart-insights';
import LoadingDotsIcon from '@/ai/icons/loading-dots-icon';
import { useGetNlgInsightsInternal } from '@/ai/use-get-nlg-insights';
import { widgetComposer } from '@/analytics-composer';
import { useCommonFilters } from '@/common-filters/use-common-filters';
import { ChartWidgetProps, WidgetProps } from '@/props';
import { NlqChartWidgetStyleOptions } from '@/types';
import { getFiltersArray } from '@/utils/filter-relations';
import { isChartWidgetProps } from '@/widget-by-id/utils';
import { ChartWidget } from '@/widgets/chart-widget';

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

  /**
   * Widget props if we have them in full, to ensure NlqChartWidget will be rendered
   * the same way as ChartWidget
   */
  widgetProps?: ChartWidgetProps;
}

/**
 * Compares NlqChartWidgetProps based on timestamp for memoization.
 * Only re-renders when nlqResponse.timestamp changes.
 */
const arePropsEqual = (prevProps: NlqChartWidgetProps, nextProps: NlqChartWidgetProps): boolean => {
  return prevProps.nlqResponse.timestamp === nextProps.nlqResponse.timestamp;
};

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
export const NlqChartWidget = memo(function NlqChartWidget({
  nlqResponse,
  onDataReady,
  styleOptions,
  widgetProps,
  filters = [],
}: NlqChartWidgetProps) {
  const timestamp = nlqResponse.timestamp;

  const normalizedNlqResponse = useMemo(
    () => ({
      ...nlqResponse,
      queryTitle: upperFirst(nlqResponse.queryTitle),
    }),
    // Memoize based on timestamp to prevent unnecessary recomputations
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timestamp],
  );

  const { connectToWidgetProps } = useCommonFilters({
    initialFilters: filters,
  });
  const [chartWidgetProps, setChartWidgetProps] = useState<WidgetProps | null>(null);

  useEffect(() => {
    const widgetPropsFromComposer = widgetComposer.toWidgetProps(normalizedNlqResponse, {
      useCustomizedStyleOptions: true,
    });
    if (!widgetPropsFromComposer) setChartWidgetProps(null);
    else {
      if (styleOptions && widgetPropsFromComposer.styleOptions) {
        widgetPropsFromComposer.styleOptions = merge(
          widgetPropsFromComposer.styleOptions,
          styleOptions,
        );
      }

      const connectedProps = connectToWidgetProps(widgetPropsFromComposer, {
        shouldAffectFilters: false,
        applyMode: 'filter',
      });

      setChartWidgetProps(connectedProps);
    }
  }, [normalizedNlqResponse, connectToWidgetProps, styleOptions]);

  const nlqResponseWithFilters: GetNlgInsightsRequest = useMemo(() => {
    const filtersArray =
      chartWidgetProps && isChartWidgetProps(chartWidgetProps)
        ? getFiltersArray(chartWidgetProps?.filters)
        : [];

    const metadata = normalizedNlqResponse.jaql.metadata
      .filter((meta) => !meta.jaql.filter)
      .concat(
        filtersArray
          .filter((filter) => !filter.config.disabled)
          .map((filter) => filter.jaql() as MetadataItem),
      );

    return {
      ...normalizedNlqResponse,
      jaql: { ...normalizedNlqResponse.jaql, metadata },
      verbosity: 'Low',
    };
  }, [normalizedNlqResponse, chartWidgetProps]);

  const { data: summary, isLoading, isError } = useGetNlgInsightsInternal(nlqResponseWithFilters);

  if (isLoading || !chartWidgetProps) {
    return <LoadingDotsIcon />;
  }

  if (!isChartWidgetProps(chartWidgetProps)) {
    return <></>;
  }

  const finalChartWidgetProps = widgetProps || {
    ...chartWidgetProps,
    styleOptions,
    onDataReady,
  };
  return (
    <ChartWidget
      {...finalChartWidgetProps}
      highlightSelectionDisabled={true}
      topSlot={
        summary &&
        !isError && (
          <ChartInsights nlgRequest={nlqResponseWithFilters} summary={summary}></ChartInsights>
        )
      }
    ></ChartWidget>
  );
},
arePropsEqual);
