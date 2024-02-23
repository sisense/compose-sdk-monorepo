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
 * import {SunburstChart,type SunburstChartProps} from '@sisense/sdk-ui-vue';
 *
const sunburstChartProps = ref<SunburstChartProps>({
  dataSet: DM.DataSource,
  dataOptions: {
    category: [dimProductName],
    value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
  },
  filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
});
 * ```
 */
export const SunburstChart = defineComponent({
  props: {
    dataOptions: Object as PropType<SunburstChartProps['dataOptions']>,
    dataSet: Object as PropType<SunburstChartProps['dataSet']>,
    filters: Object as PropType<SunburstChartProps['filters']>,
    highlights: Object as PropType<SunburstChartProps['highlights']>,
    onBeforeRender: Function as PropType<SunburstChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<SunburstChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<SunburstChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<SunburstChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<SunburstChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(SunburstChartPreact, props),
});
