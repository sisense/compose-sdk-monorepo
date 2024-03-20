import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreamapChart as AreamapChartPreact } from '@sisense/sdk-ui-preact';
import type { AreamapChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component for visualizing geographical data as polygons on a map.
 * See [Areamap Chart](https://docs.sisense.com/main/SisenseLinux/area-map.htm) for more information.
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
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {AreamapChart, type AreamapChartProps} from '@sisense/sdk-ui-vue';

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
 * @beta
 */
export const AreamapChart = defineComponent({
  props: {
    dataOptions: Object as PropType<AreamapChartProps['dataOptions']>,
    dataSet: Object as PropType<AreamapChartProps['dataSet']>,
    filters: Object as PropType<AreamapChartProps['filters']>,
    highlights: Object as PropType<AreamapChartProps['highlights']>,
    styleOptions: Object as PropType<AreamapChartProps['styleOptions']>,
    onDataPointClick: Function as PropType<AreamapChartProps['onDataPointClick']>,
  },
  setup: (props) => setupHelper(AreamapChartPreact, props),
});
