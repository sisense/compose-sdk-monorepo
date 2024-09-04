import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { LineChart as LineChartPreact } from '@sisense/sdk-ui-preact';
import type { LineChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the LineChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the LineChart.
 *
 * @example
 * Here's how you can use the LineChart component in a Vue application:
 * ```vue
 * <template>
      <LineChart
        :dataOptions="lineChartProps.dataOptions"
        :dataSet="lineChartProps.dataSet"
        :filters="lineChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { LineChart, type LineChartProps } from '@sisense/sdk-ui-vue';

 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const lineChartProps = ref<LineChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
      breakBy: [],
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://vue-line-chart-example.png" width="800px" />
 * @param props - Line chart properties
 * @returns Line Chart component
 * @group Charts
 */
export const LineChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: Object as PropType<LineChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<LineChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<LineChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<LineChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<LineChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<LineChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<LineChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<LineChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!LineChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<LineChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(LineChartPreact, props),
});
