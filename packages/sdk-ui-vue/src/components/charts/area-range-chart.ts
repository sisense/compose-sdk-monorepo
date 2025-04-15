import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreaRangeChart as AreaRangeChartPreact } from '@sisense/sdk-ui-preact';
import type { AreaRangeChartProps as AreaRangeChartPropsPreact } from '@sisense/sdk-ui-preact';
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
 * Here's how you can use the AreaRangeChart component in a Vue application:
 * ```vue
 * <template>
 * <AreaRangeChart
      :dataOptions="areaRangeChartProps.dataOptions"
      :dataSet="areaRangeChartProps.dataSet"
      :filters="areaRangeChartProps.filters"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { AreaRangeChart, type AreaRangeChartProps } from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const areaRangeChartProps = ref<AreaRangeChartProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     category: [dimProductName],
 *     value: [{
 *       title: 'Order Revenue',
 *       upperBound: measureFactory.multiply(
 *         measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Lower Revenue'),
 *         0.6,
 *       ),
 *       lowerBound: measureFactory.multiply(
 *         measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Upper Revenue'),
 *         1.4,
 *       ),
 *     }],
 *     breakBy: [],
 *   },
 *   filters: [],
 * });
 * ```
 * <img src="media://vue-area-range-chart-example.png" width="800"/>
 * @param {AreaRangeChartProps} - Area chart properties
 * @returns Area Range Chart component
 * @group Charts
 * @beta
 */
export const AreaRangeChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: Object as PropType<AreaRangeChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<AreaRangeChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<AreaRangeChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaRangeChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<AreaRangeChartProps['highlights']>,
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
     * @internal
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
  setup: (props) => setupHelper(AreaRangeChartPreact, props as AreaRangeChartPropsPreact),
});
