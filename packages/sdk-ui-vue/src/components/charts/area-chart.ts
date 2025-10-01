import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreaChart as AreaChartPreact } from '@ethings-os/sdk-ui-preact';
import type { AreaChartProps as AreaChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!AreaChart | `AreaChart`} component.
 */
export interface AreaChartProps extends AreaChartPropsPreact {}

/**
 * A Vue component similar to a {@link LineChart},
 * but with filled in areas under each line and an option to display them as stacked.
 *
 * @example
 * Here's how you can use the AreaChart component in a Vue application:
 * ```vue
 * <template>
 * <AreaChart
      :dataOptions="areaChartProps.dataOptions"
      :dataSet="areaChartProps.dataSet"
      :filters="areaChartProps.filters"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { AreaChart, type AreaChartProps } from '@ethings-os/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const areaChartProps = ref<AreaChartProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     category: [dimProductName],
 *     value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
 *     breakBy: [],
 *   },
 *   filters: [],
 * });
 * ```
 * <img src="media://vue-area-chart-example.png" width="800"/>
 * @param {AreaChartProps} - Area chart properties
 * @returns Area Chart component
 * @group Charts
 */
export const AreaChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<AreaChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<AreaChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<AreaChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<AreaChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<AreaChartProps['styleOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<AreaChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<AreaChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<AreaChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<AreaChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreaChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<AreaChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(AreaChartPreact, props),
});
