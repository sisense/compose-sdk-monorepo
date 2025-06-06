import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ScattermapChart as ScattermapChartPreact } from '@sisense/sdk-ui-preact';
import type { ScattermapChartProps as ScattermapChartPropsPreact } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!ScattermapChart | `ScattermapChart`} component.
 */
export interface ScattermapChartProps extends ScattermapChartPropsPreact {}

/**
 * A Vue component that wraps the ScattermapChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the ScattermapChart.
 *
 * @example
 * Here's how you can use the ScattermapChart component in a Vue application:
 * ```vue
 * <template>
      <ScattermapChart
        :dataOptions="scattermapChartProps.dataOptions"
        :dataSet="scattermapChartProps.dataSet"
        :filters="scattermapChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { ScattermapChart,type ScattermapChartProps } from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const scattermapChartProps = ref<ScattermapChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      geo: [DM.DimCountries.CountryName],
      size: { column: measureTotalRevenue, title: 'Total Revenue' },
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * </script>
 * ```
 * <img src="media://vue-scattermap-chart-example.png" width="600px" />
 * @param props - Scattermap chart properties
 * @returns Scattermap Chart component
 * @group Charts
 */
export const ScattermapChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ScattermapChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ScattermapChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ScattermapChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ScattermapChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ScattermapChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ScattermapChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Object as PropType<ScattermapChartProps['onDataPointClick']>,
  },
  setup: (props) => setupHelper(ScattermapChartPreact, props),
});
