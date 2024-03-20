import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreaChart as AreaChartPreact } from '@sisense/sdk-ui-preact';
import type { AreaChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component similar to a {@link LineChart},
 * but with filled in areas under each line and an option to display them as stacked.
 * More info on [Sisense Documentation page](https://docs.sisense.com/main/SisenseLinux/area-chart.htm).
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
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {AreaChart, type AreaChartProps} from '@sisense/sdk-ui-vue';
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
    dataOptions: Object as PropType<AreaChartProps['dataOptions']>,
    dataSet: Object as PropType<AreaChartProps['dataSet']>,
    filters: Object as PropType<AreaChartProps['filters']>,
    highlights: Object as PropType<AreaChartProps['highlights']>,
    onBeforeRender: Function as PropType<AreaChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<AreaChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<AreaChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<AreaChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<AreaChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(AreaChartPreact, props),
});
