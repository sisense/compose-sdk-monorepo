import { AreaRangeChart as AreaRangeChartPreact } from '@sisense/sdk-ui-preact';
import type { AreaRangeChartProps as AreaRangeChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!AreaRangeChart | `AreaRangeChart`} component.
 */
export interface AreaRangeChartProps extends AreaRangeChartPropsPreact {}

/**
 * A Vue component that displays a range of data over a given time period
 * or across multiple categories. It is particularly useful for visualizing
 * the minimum and maximum values in a dataset, along with the area between these values.
 *
 * @example
 * Area range chart displaying total revenue per quarter from the Sample ECommerce data model,
 * with the range spanning 60%-140% of the actual revenue.
 *
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { AreaRangeChart, type AreaRangeChartProps } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref<{ dataOptions: AreaRangeChartProps['dataOptions'] }>({
 *   dataOptions: {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [
 *       {
 *         title: 'Revenue',
 *         upperBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 1.4, 'Upper Revenue'),
 *         lowerBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 0.6, 'Lower Revenue'),
 *       },
 *     ],
 *     breakBy: [],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <AreaRangeChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 *
 * <img src="media://area-range-chart-example-1.png" width="700px" />
 *
 * The same range broken down by condition:
 *
 * ```vue
 * chartProps.value.dataOptions = {
 *   category: [DM.Commerce.Date.Quarters],
 *   value: [
 *     {
 *       title: 'Revenue',
 *       upperBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 1.4, 'Upper Revenue'),
 *       lowerBound: measureFactory.multiply(measureFactory.sum(DM.Commerce.Revenue), 0.6, 'Lower Revenue'),
 *     },
 *   ],
 *   breakBy: [DM.Commerce.Condition],
 * };
 * ```
 *
 * <img src="media://area-range-chart-example-2.png" width="700px" />
 * @param {AreaRangeChartProps} - Area chart properties
 * @returns Area Range Chart component
 * @group Charts
 */
export const AreaRangeChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<AreaRangeChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<AreaRangeChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<AreaRangeChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<AreaRangeChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<AreaRangeChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<AreaRangeChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointClick}
     *
     * @category Callbacks
     */

    onDataPointClick: Function as PropType<AreaRangeChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<AreaRangeChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<AreaRangeChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<AreaRangeChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(AreaRangeChartPreact, props),
});
