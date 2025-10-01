import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { SunburstChart as SunburstChartPreact } from '@ethings-os/sdk-ui-preact';
import type { SunburstChartProps as SunburstChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!SunburstChart | `SunburstChart`} component.
 */
export interface SunburstChartProps extends SunburstChartPropsPreact {}

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
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { SunburstChart,type SunburstChartProps } from '@ethings-os/sdk-ui-vue';
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
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<SunburstChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<SunburstChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<SunburstChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<SunburstChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<SunburstChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<SunburstChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<SunburstChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<SunburstChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<SunburstChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!SunburstChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<SunburstChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(SunburstChartPreact, props),
});
