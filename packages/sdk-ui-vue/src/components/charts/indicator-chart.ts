import { IndicatorChart as IndicatorChartPreact } from '@sisense/sdk-ui-preact';
import type { IndicatorChartProps as IndicatorChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!IndicatorChart | `IndicatorChart`} component.
 */
export interface IndicatorChartProps extends IndicatorChartPropsPreact {}

/**
 * A Vue component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { IndicatorChart, IndicatorStyleOptions } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     max: [measureFactory.constant(125000000)],
 *   },
 *   styleOptions: {
 *     indicatorComponents: {
 *       title: { shouldBeShown: true, text: 'Total Revenue' },
 *       ticks: { shouldBeShown: false },
 *       labels: { shouldBeShown: true },
 *     },
 *     subtype: 'indicator/gauge',
 *     skin: 2,
 *   } as IndicatorStyleOptions,
 * });
 * </script>
 *
 * <template>
 *   <IndicatorChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://indicator-chart-example-1.png" width="400px" />
 *
 * Numeric indicator variant with a secondary value:
 *
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { IndicatorChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     // secondary value is optional
 *     secondary: [measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity')],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <IndicatorChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 *
 * <img src="media://indicator-chart-example-3.png" width="400px" />
 *
 * Ticker style indicator variant:
 *
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { IndicatorChart, IndicatorStyleOptions } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     max: [measureFactory.constant(125000000)],
 *   },
 *   styleOptions: {
 *     indicatorComponents: {
 *       title: { shouldBeShown: true, text: 'Total Revenue' },
 *       ticks: { shouldBeShown: false },
 *       labels: { shouldBeShown: true },
 *     },
 *     subtype: 'indicator/gauge',
 *     skin: 2,
 *     forceTickerView: true,
 *     tickerBarHeight: 30,
 *     width: 400,
 *   } as IndicatorStyleOptions,
 * });
 * </script>
 *
 * <template>
 *   <IndicatorChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 *
 * <img src="media://indicator-chart-example-4.png" width="400px" />
 * @param props - Indicator chart properties
 * @returns Indicator Chart component
 * @group Charts
 */
export const IndicatorChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<IndicatorChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<IndicatorChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<IndicatorChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<IndicatorChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<IndicatorChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<IndicatorChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<IndicatorChartProps['onDataReady']>,
  },
  setup: (props) => setupHelper(IndicatorChartPreact, props),
});
