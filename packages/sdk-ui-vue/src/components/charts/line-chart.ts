import { LineChart as LineChartPreact } from '@sisense/sdk-ui-preact';
import type { LineChartProps as LineChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!LineChart | `LineChart`} component.
 */
export interface LineChartProps extends LineChartPropsPreact {}

/**
 * A Vue component that wraps the LineChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the LineChart.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { LineChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <LineChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 * <img src="media://line-chart-example-1.png" width="700px" />
 * @param props - Line chart properties
 * @returns Line Chart component
 * @group Charts
 */
export const LineChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<LineChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<LineChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<LineChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<LineChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<LineChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<LineChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<LineChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<LineChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<LineChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<LineChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(LineChartPreact, props),
});
