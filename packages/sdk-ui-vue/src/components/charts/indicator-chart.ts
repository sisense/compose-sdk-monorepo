import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { IndicatorChart as IndicatorChartPreact } from '@ethings-os/sdk-ui-preact';
import type { IndicatorChartProps as IndicatorChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!IndicatorChart | `IndicatorChart`} component.
 */
export interface IndicatorChartProps extends IndicatorChartPropsPreact {}

/**
 * A Vue component that provides various options for displaying one or two numeric values as a number, gauge or ticker.
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
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { IndicatorChart, type IndicatorChartProps } from '@ethings-os/sdk-ui-vue';

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
    /**
     * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<IndicatorChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<IndicatorChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<IndicatorChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<IndicatorChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<IndicatorChartProps['styleOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<IndicatorChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<IndicatorChartProps['onDataReady']>,
  },
  setup: (props) => setupHelper(IndicatorChartPreact, props),
});
