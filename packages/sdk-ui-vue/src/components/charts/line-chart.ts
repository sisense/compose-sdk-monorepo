import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { LineChart as LineChartPreact } from '@ethings-os/sdk-ui-preact';
import type { LineChartProps as LineChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!LineChart | `LineChart`} component.
 */
export interface LineChartProps extends LineChartPropsPreact {}

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
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { LineChart, type LineChartProps } from '@ethings-os/sdk-ui-vue';

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
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<LineChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<LineChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<LineChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<LineChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<LineChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<LineChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<LineChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<LineChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<LineChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!LineChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<LineChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(LineChartPreact, props),
});
