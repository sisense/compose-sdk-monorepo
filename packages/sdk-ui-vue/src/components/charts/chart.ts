import { defineComponent, type PropType } from 'vue';
import { Chart as ChartPreact, type ChartProps } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

// Note: uses direct reexport as a temporary workaround for getting the correct API docs
export { ChartProps };

/**
 * A Vue component used for easily switching chart types or rendering multiple series of different chart types.
 *
 * @example
 * An example of using the `Chart` component to
 * plot a bar chart of the Sample Retail data source hosted in a Sisense instance:
 * ```tsx
 * <script setup lang="ts">
 * import { Chart } from '@ethings-os/sdk-ui-vue';
 * import type { ChartProps } from '@ethings-os/sdk-ui-vue';
 * import * as DM from '../assets/sample-retail-model';
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
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
 * @shortDescription Common component for rendering charts of different types including table
 * @param props - Chart properties
 * @returns Chart component representing a chart type as specified in `ChartProps.`{@link ChartProps.chartType | chartType}
 * @group Charts
 */
export const Chart = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.chartType}
     *
     * @category Chart
     */
    chartType: {
      type: String as PropType<ChartProps['chartType']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ChartProps['styleOptions']>,
    /**
     * @internal
     */
    refreshCounter: Number as PropType<ChartProps['refreshCounter']>,
  },
  setup: (props) => setupHelper(ChartPreact, props),
});
