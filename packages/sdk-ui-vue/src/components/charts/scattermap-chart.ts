import { ScattermapChart as ScattermapChartPreact } from '@sisense/sdk-ui-preact';
import type { ScattermapChartProps as ScattermapChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!ScattermapChart | `ScattermapChart`} component.
 */
export interface ScattermapChartProps extends ScattermapChartPropsPreact {}

/**
 * A Vue component that wraps the ScattermapChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the ScattermapChart.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { ScattermapChart, type ScattermapChartDataOptions } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref<{ dataOptions: ScattermapChartDataOptions }>({
 *   dataOptions: {
 *     geo: [DM.Country.Country],
 *     size: measureFactory.sum(DM.Commerce.Cost, 'Size by Cost'),
 *     colorBy: {
 *       column: measureFactory.rank(measureFactory.sum(DM.Commerce.Revenue, 'Color by Revenue Rank')),
 *       color: { type: 'range', steps: 7, minColor: '#cf9270', maxColor: '#3900b3' },
 *     },
 *     details: DM.Brand.Brand,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <ScattermapChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 * <img src="media://scattermap-chart-example-1.png" width="700px" />
 * @param props - Scattermap chart properties
 * @returns Scattermap Chart component
 * @group Charts
 */
export const ScattermapChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ScattermapChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ScattermapChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ScattermapChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ScattermapChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ScattermapChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ScattermapChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Object as PropType<ScattermapChartProps['onDataPointClick']>,
  },
  setup: (props) => setupHelper(ScattermapChartPreact, props),
});
