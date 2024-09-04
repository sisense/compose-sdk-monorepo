import { defineComponent, type PropType } from 'vue';
import { PolarChart as PolarChartPreact, type PolarChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component comparing multiple categories/variables with a spacial perspective in a radial chart.
 *
 * @example
 * Here's how you can use the PolarChart component in a Vue application:
 * ```vue
 * <template>
      <PolarChart
        :dataOptions="polarChartProps.dataOptions"
        :dataSet="polarChartProps.dataSet"
        :filters="polarChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { PolarChart,type PolarChartProps } from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const polarChartProps = ref<PolarChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
      breakBy: [],
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://vue-polar-chart-example.png" width="600px" />
 * @param props - Polar chart properties
 * @returns Polar Chart component
 * @group Charts
 */
export const PolarChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: Object as PropType<PolarChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<PolarChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<PolarChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<PolarChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<PolarChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<PolarChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<PolarChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<PolarChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PolarChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<PolarChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PolarChartPreact, props),
});
