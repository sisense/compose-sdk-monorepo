import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { PieChart as PieChartPreact } from '@sisense/sdk-ui-preact';
import type { PieChartProps as PieChartPropsPreact } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!PieChart | `PieChart`} component.
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
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { PieChart,type PieChartProps } from '@sisense/sdk-ui-vue';
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
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: Object as PropType<PieChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<PieChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<PieChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PieChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<PieChartProps['highlights']>,
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
     * @internal
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
