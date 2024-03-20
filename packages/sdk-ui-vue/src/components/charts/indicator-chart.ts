import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { IndicatorChart as IndicatorChartPreact } from '@sisense/sdk-ui-preact';
import type { IndicatorChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
 * See [Indicator](https://docs.sisense.com/main/SisenseLinux/indicator.htm) for more information.
 *
 * @example
 * Here's how you can use the IndicatorChart component in a Vue application:
 * ```vue
 * <template>
      <IndicatorChart
        :dataOptions="indicatorChartProps.dataOptions"
        :dataSet="indicatorChartProps.dataSet"
        :filters="indicatorChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {IndicatorChart, type IndicatorChartProps} from '@sisense/sdk-ui-vue';

 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
   const indicatorChartProps = ref<IndicatorChartProps>({
     dataSet: DM.DataSource,
    dataOptions: {
       value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
     },
     filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
   });
 * </script>
 * ```
 * <img src="media://vue-indicator-chart-example.png" width="400px" />
 * @param props - Indicator chart properties
 * @returns Indicator Chart component
 * @group Charts
 */
export const IndicatorChart = defineComponent({
  props: {
    dataOptions: Object as PropType<IndicatorChartProps['dataOptions']>,
    dataSet: Object as PropType<IndicatorChartProps['dataSet']>,
    filters: Object as PropType<IndicatorChartProps['filters']>,
    highlights: Object as PropType<IndicatorChartProps['highlights']>,
    styleOptions: Object as PropType<IndicatorChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(IndicatorChartPreact, props),
});
