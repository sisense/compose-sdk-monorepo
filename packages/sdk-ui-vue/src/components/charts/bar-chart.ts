import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { BarChart as BarChartPreact } from '@sisense/sdk-ui-preact';
import type { BarChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the BarChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the BarChart.
 *
 * @example
 * Here's how you can use the BarChart component in a Vue application:
 * ```vue
 * <template>
 *   <BarChart :props="barChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import BarChart from '@sisense/sdk-ui-vue/BarChart';
 *
 * const barChartProps = ref({
 *   // Configure your BarChartProps here
 * });
 * </script>
 * ```
 */
export const BarChart = defineComponent({
  props: {
    /**
     * Bar chart properties derived from the BarChartProps interface,
     * including both BaseChartProps and ChartEventProps.
     */
    dataOptions: Object as PropType<BarChartProps['dataOptions']>,
    dataSet: Object as PropType<BarChartProps['dataSet']>,
    filters: Object as PropType<BarChartProps['filters']>,
    highlights: Object as PropType<BarChartProps['highlights']>,
    onBeforeRender: Function as PropType<BarChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<BarChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<BarChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<BarChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<BarChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(BarChartPreact, props),
});
