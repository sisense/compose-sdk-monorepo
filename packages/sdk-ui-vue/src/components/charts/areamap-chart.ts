import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreamapChart as AreamapChartPreact } from '@ethings-os/sdk-ui-preact';
import type { AreamapChartProps as AreamapChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!AreamapChart | `AreamapChart`} component.
 */
export interface AreamapChartProps extends AreamapChartPropsPreact {}

/**
 * A Vue component for visualizing geographical data as polygons on a map.
 *
 * @example
 * Here's how you can use the AreamapChart component in a Vue application:
 * ```vue
 * <template>
    <AreamapChart
      :dataOptions="areamapChartProps.dataOptions"
      :dataSet="areamapChartProps.dataSet"
      :filters="areamapChartProps.filters"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { AreamapChart, type AreamapChartProps } from '@ethings-os/sdk-ui-vue';

 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');

  const areamapChartProps = ref<AreamapChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      geo: [DM.DimCountries.CountryName],
      color: [{ column: measureTotalRevenue, title: 'Total Revenue' }],
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * </script>
 * ```
 * <img src="media://vue-areamap-chart-example.png" width="600px" />
 * @param props - Areamap chart properties
 * @returns Areamap Chart component
 * @group Charts
 */
export const AreamapChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<AreamapChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<AreamapChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<AreamapChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<AreamapChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<AreamapChartProps['styleOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<AreamapChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.onDataPointClick}
     *
     * @category Callbacks
     */

    onDataPointClick: Function as PropType<AreamapChartProps['onDataPointClick']>,
  },
  setup: (props) => setupHelper(AreamapChartPreact, props),
});
