import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { BoxplotChart as BoxplotChartPreact } from '@sisense/sdk-ui-preact';
import type { BoxplotChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component representing data in a way that visually describes the distribution, variability,
 * and center of a data set along an axis.
 * See [Boxplot Chart](https://docs.sisense.com/main/SisenseLinux/box-and-whisker-plot.htm) for more information.
 * @example
 * Here's how you can use the BoxplotChart component in a Vue application:
 * ```vue
 * <template>
    <BoxplotChart
        :dataOptions="boxplotChartProps.dataOptions"
        :dataSet="boxplotChartProps.dataSet"
        :filters="boxplotChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {BoxplotChart, type BoxplotChartProps} from '@sisense/sdk-ui-vue';
 *
  const boxplotChartProps = ref<BoxplotChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [DM.Fact_Sale_orders.OrderRevenue],
      boxType: 'iqr',
      outliersEnabled: true,
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://boxplot-chart-example-1.png" width="600px" />
 * @param props - Boxplot chart properties
 * @returns Boxplot Chart component
 * @beta
 */
export const BoxplotChart = defineComponent({
  props: {
    dataOptions: Object as PropType<BoxplotChartProps['dataOptions']>,
    dataSet: Object as PropType<BoxplotChartProps['dataSet']>,
    filters: Object as PropType<BoxplotChartProps['filters']>,
    highlights: Object as PropType<BoxplotChartProps['highlights']>,
    styleOptions: Object as PropType<BoxplotChartProps['styleOptions']>,
    onBeforeRender: Function as PropType<BoxplotChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<BoxplotChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<BoxplotChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<BoxplotChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(BoxplotChartPreact, props),
});
