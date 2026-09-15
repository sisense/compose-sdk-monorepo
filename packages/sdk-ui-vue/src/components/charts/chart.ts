import { Chart as ChartPreact, type ChartProps } from '@sisense/sdk-ui-preact';
import { defineComponent, type PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

// Note: uses direct reexport as a temporary workaround for getting the correct API docs
export { ChartProps };

/**
 * A Vue component used for easily switching chart types or rendering multiple series of different chart types.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { Chart, ChartDataOptions, ChartType } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   chartType: 'column' as ChartType,
 *   dataOptions: {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [],
 *   } as ChartDataOptions,
 * });
 * </script>
 *
 * <template>
 *   <Chart :chartType="chartProps.chartType" :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 * <img src="media://chart-example-1.png" width="700px" />
 * @shortDescription Common component for rendering charts of different types including table
 * @param props - Chart properties
 * @returns Chart component representing a chart type as specified in `ChartProps.`{@link ChartProps.chartType | chartType}
 * @group Charts
 */
export const Chart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.chartType}
     *
     * @category Chart
     */
    chartType: {
      type: String as PropType<ChartProps['chartType']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ChartProps['styleOptions']>,
    /**
     * @internal
     */
    refreshCounter: Number as PropType<ChartProps['refreshCounter']>,
  },
  setup: (props) => setupHelper(ChartPreact, props),
});
