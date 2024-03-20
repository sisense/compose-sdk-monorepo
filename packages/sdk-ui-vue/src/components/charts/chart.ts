import { defineComponent, type PropType } from 'vue';
import { Chart as ChartPreact, type ChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component used for easily switching chart types or rendering multiple series of different chart types.
 *
 * @example
 * An example of using the `Chart` component to
 * plot a bar chart of the Sample Retail data source hosted in a Sisense instance:
 * ```tsx
 * <script setup lang="ts">
 * import { Chart } from '@sisense/sdk-ui-vue';
 * import type { ChartProps } from '@sisense/sdk-ui-vue';
 * import * as DM from '../assets/sample-retail-model';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import { ref } from 'vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 *
const chartProps = ref<ChartProps>({
  chartType: 'bar',
  dataSet: DM.DataSource,
  dataOptions: {
    category: [dimProductName],
    value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
    breakBy: [],
  },
  filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  styleOptions: {
    xAxis: {
      title: {
        text: 'Product Name',
        enabled: true,
      },
    },
    yAxis: {
      title: {
        text: 'Total Revenue',
        enabled: true,
      },
    },
  },
});
 * </script>
 *
 * <template>
     <Chart
       :chartType="chartProps.chartType"
       :dataSet="chartProps.dataSet"
       :dataOptions="chartProps.dataOptions"
       :filters="chartProps.filters"
       :styleOptions="chartProps.styleOptions"
     />
 * </template>
 * ```
 *
 * <img src="media://vue-chart-example.png" width="800px" />
 * @param props - Chart properties
 * @returns Chart component representing a chart type as specified in `ChartProps.`{@link ChartProps.chartType | chartType}
 * @group Charts
 */
export const Chart = defineComponent({
  props: {
    chartType: String as PropType<ChartProps['chartType']>,
    dataOptions: Object as PropType<ChartProps['dataOptions']>,
    dataSet: Object as PropType<ChartProps['dataSet']>,
    filters: Array as PropType<ChartProps['filters']>,
    highlights: Array as PropType<ChartProps['highlights']>,
    onBeforeRender: Function as PropType<ChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<ChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<ChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<ChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<ChartProps['styleOptions']>,
    refreshCounter: Number as PropType<ChartProps['refreshCounter']>,
  },
  setup: (props) => setupHelper(ChartPreact, props),
});
