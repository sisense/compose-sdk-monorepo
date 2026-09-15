import { BarChart as BarChartPreact } from '@sisense/sdk-ui-preact';
import type { BarChartProps as BarChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!BarChart | `BarChart`} component.
 */
export interface BarChartProps extends BarChartPropsPreact {}

/**
 * A Vue component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { BarChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [DM.Commerce.Date.Years],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <BarChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 * <img src="media://bar-chart-example-1.png" width="700px" />
 * @param props - Bar chart properties
 * @returns Bar Chart component
 * @group Charts
 */
export const BarChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<BarChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<BarChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<BarChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<BarChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<BarChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<BarChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<BarChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<BarChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<BarChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<BarChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(BarChartPreact, props),
});
