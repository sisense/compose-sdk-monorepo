import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ColumnChart as ColumnChartPreact } from '@sisense/sdk-ui-preact';
import type { ColumnChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 *
 * @example
 * Here's how you can use the ColumnChart component in a Vue application:
 * ```vue
 * <template>
      <ColumnChart
        :dataOptions="columnChartProps.dataOptions"
        :dataSet="columnChartProps.dataSet"
        :filters="columnChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {ColumnChart, type ColumnChartProps} from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');

const columnChartProps = ref<ColumnChartProps>({
  dataSet: DM.DataSource,
  dataOptions: {
    category: [dimProductName],
    value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
    breakBy: [],
  },
  filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
});
 * ```
 * <img src="media://vue-column-chart-example.png" width="800"/>
 * @param props - Column chart properties
 * @returns Column Chart component
 * @group Charts
 */
export const ColumnChart = defineComponent({
  props: {
    dataOptions: Object as PropType<ColumnChartProps['dataOptions']>,
    dataSet: Object as PropType<ColumnChartProps['dataSet']>,
    filters: Object as PropType<ColumnChartProps['filters']>,
    highlights: Object as PropType<ColumnChartProps['highlights']>,
    onBeforeRender: Function as PropType<ColumnChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<ColumnChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<ColumnChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<ColumnChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<ColumnChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ColumnChartPreact, props),
});
