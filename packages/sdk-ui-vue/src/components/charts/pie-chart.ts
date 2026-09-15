import { PieChart as PieChartPreact } from '@sisense/sdk-ui-preact';
import type { PieChartProps as PieChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!PieChart | `PieChart`} component.
 */
export interface PieChartProps extends PieChartPropsPreact {}

/**
 * A Vue component representing data in a circular graph with the data shown as slices of a whole,
 * with each slice representing a proportion of the total.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { PieChart, PieStyleOptions } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   },
 *   styleOptions: { subtype: 'pie/classic' } as PieStyleOptions,
 * });
 * </script>
 *
 * <template>
 *   <PieChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://pie-chart-example-1.png" width="700px" />
 * @param props - Pie chart properties
 * @returns Pie Chart component
 * @group Charts
 */
export const PieChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<PieChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<PieChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<PieChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<PieChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<PieChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<PieChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<PieChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<PieChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<PieChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<PieChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PieChartPreact, props),
});
