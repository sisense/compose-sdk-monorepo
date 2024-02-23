import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { BarChart as BarChartPreact } from '@sisense/sdk-ui-preact';
import type { BarChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component representing categorical data with horizontal rectangular bars,
 * whose lengths are proportional to the values that they represent.
 * See [Bar Chart](https://docs.sisense.com/main/SisenseLinux/bar-chart.htm) for more information.
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
 * import {BarChart} from '@sisense/sdk-ui-vue';
 *
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
 * <img src="media://bar-chart-example-1.png" width="800"/>
 * @param props - Bar chart properties
 * @returns Bar Chart component
 */
export const BarChart = defineComponent({
  props: {
    /**
     * Bar chart properties derived from the BarChartProps interface,
     * including both BaseChartProps and ChartEventProps.
     */
    dataOptions: Object as PropType<BarChartProps['dataOptions']>,
    dataSet: Object as PropType<BarChartProps['dataSet']>,
    filters: Object as PropType<BarChartProps['filters']>,
    highlights: Object as PropType<BarChartProps['highlights']>,
    onBeforeRender: Function as PropType<BarChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<BarChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<BarChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<BarChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<BarChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(BarChartPreact, props),
});
