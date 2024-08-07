import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { BarChart as BarChartPreact } from '@sisense/sdk-ui-preact';
import type { BarChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 *
 * @example
 * Here's how you can use the BarChart component in a Vue application:
 * ```vue
 * <template>
    <BarChart
      :dataOptions="barChartProps.dataOptions"
      :dataSet="barChartProps.dataSet"
      :filters="barChartProps.filters"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {BarChart,type BarChartProps} from '@sisense/sdk-ui-vue';

 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
  const barChartProps = ref<BarChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
      breakBy: [],
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * </script>
 * ```
 * <img src="media://vue-bar-chart-example.png" width="800"/>
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
    dataOptions: Object as PropType<BarChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<BarChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<BarChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<BarChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BarChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<BarChartProps['onBeforeRender']>,
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
