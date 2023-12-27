import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { PieChart as PieChartPreact } from '@sisense/sdk-ui-preact';
import type { PieChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the PieChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the PieChart.
 *
 * @example
 * Here's how you can use the PieChart component in a Vue application:
 * ```vue
 * <template>
 *   <PieChart :props="pieChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import PieChart from '@sisense/sdk-ui-vue/PieChart';
 *
 * const pieChartProps = ref({
 *   // Configure your PieChartProps here
 * });
 * </script>
 * ```
 */
export const PieChart = defineComponent({
  props: {
    dataOptions: Object as PropType<PieChartProps['dataOptions']>,
    dataSet: Object as PropType<PieChartProps['dataSet']>,
    filters: Object as PropType<PieChartProps['filters']>,
    highlights: Object as PropType<PieChartProps['highlights']>,
    onBeforeRender: Function as PropType<PieChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<PieChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<PieChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<PieChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<PieChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PieChartPreact, props),
});
