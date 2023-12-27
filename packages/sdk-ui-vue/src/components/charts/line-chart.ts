import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { LineChart as LineChartPreact } from '@sisense/sdk-ui-preact';
import type { LineChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the LineChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the LineChart.
 *
 * @example
 * Here's how you can use the LineChart component in a Vue application:
 * ```vue
 * <template>
 *   <LineChart :props="lineChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import LineChart from '@sisense/sdk-ui-vue/LineChart';
 *
 * const lineChartProps = ref({
 *   // Configure your LineChartProps here
 * });
 * </script>
 * ```
 */
export const LineChart = defineComponent({
  props: {
    dataOptions: Object as PropType<LineChartProps['dataOptions']>,
    dataSet: Object as PropType<LineChartProps['dataSet']>,
    filters: Object as PropType<LineChartProps['filters']>,
    highlights: Object as PropType<LineChartProps['highlights']>,
    onBeforeRender: Function as PropType<LineChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<LineChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<LineChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<LineChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<LineChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(LineChartPreact, props),
});
