import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { PieChart as PieChartPreact } from '@sisense/sdk-ui-preact';
import type { PieChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

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
 * import {PieChart,type PieChartProps} from '@sisense/sdk-ui-vue';
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
    dataOptions: Object as PropType<PieChartProps['dataOptions']>,
    dataSet: Object as PropType<PieChartProps['dataSet']>,
    filters: Object as PropType<PieChartProps['filters']>,
    highlights: Object as PropType<PieChartProps['highlights']>,
    onBeforeRender: Function as PropType<PieChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<PieChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<PieChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<PieChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<PieChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PieChartPreact, props),
});
