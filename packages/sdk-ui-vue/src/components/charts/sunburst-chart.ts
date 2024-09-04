import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { SunburstChart as SunburstChartPreact } from '@sisense/sdk-ui-preact';
import type { SunburstChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the SunburstChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the SunburstChart.
 *
 * @example
 * Here's how you can use the SunburstChart component in a Vue application:
 * ```vue
 * <template>
    <SunburstChart
      :dataOptions="sunburstChartProps.dataOptions"
      :dataSet="sunburstChartProps.dataSet"
      :filters="sunburstChartProps.filters"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { SunburstChart,type SunburstChartProps } from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const sunburstChartProps = ref<SunburstChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://vue-sunburst-chart-example.png" width="600px" />
 * @param props - Sunburst Chart properties
 * @returns Sunburst Chart component
 * @group Charts
 */
export const SunburstChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: Object as PropType<SunburstChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<SunburstChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<SunburstChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<SunburstChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<SunburstChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<SunburstChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<SunburstChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<SunburstChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<SunburstChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(SunburstChartPreact, props),
});
