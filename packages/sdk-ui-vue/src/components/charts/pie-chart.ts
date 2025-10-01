import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { PieChart as PieChartPreact } from '@ethings-os/sdk-ui-preact';
import type { PieChartProps as PieChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!PieChart | `PieChart`} component.
 */
export interface PieChartProps extends PieChartPropsPreact {}

/**
 * A Vue component representing data in a circular graph with the data shown as slices of a whole,
 * with each slice representing a proportion of the total.
 *
 * @example
 * Here's how you can use the PieChart component in a Vue application:
 * ```vue
 * <template>
      <PieChart
        :dataOptions="pieChartProps.dataOptions"
        :dataSet="pieChartProps.dataSet"
        :filters="pieChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { PieChart,type PieChartProps } from '@ethings-os/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const pieChartProps = ref<PieChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://vue-pie-chart-example.png" width="800px" />
 * @param props - Pie chart properties
 * @returns Pie Chart component
 * @group Charts
 */
export const PieChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<PieChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<PieChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<PieChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<PieChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<PieChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<PieChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<PieChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<PieChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<PieChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!PieChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<PieChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PieChartPreact, props),
});
