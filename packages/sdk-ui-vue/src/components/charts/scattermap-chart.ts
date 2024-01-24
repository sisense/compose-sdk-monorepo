import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ScattermapChart as ScattermapChartPreact } from '@sisense/sdk-ui-preact';
import type { ScattermapChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the ScattermapChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the ScattermapChart.
 *
 * @example
 * Here's how you can use the ScattermapChart component in a Vue application:
 * ```vue
 * <template>
 *   <ScattermapChart :props="ScattermapChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import ScattermapChart from '@sisense/sdk-ui-vue/ScattermapChart';
 *
 * const ScattermapChartProps = ref({
 *   // Configure your ScattermapChartProps here
 * });
 * </script>
 * ```
 */
export const ScattermapChart = defineComponent({
  props: {
    dataOptions: Object as PropType<ScattermapChartProps['dataOptions']>,
    dataSet: Object as PropType<ScattermapChartProps['dataSet']>,
    filters: Object as PropType<ScattermapChartProps['filters']>,
    highlights: Object as PropType<ScattermapChartProps['highlights']>,
    styleOptions: Object as PropType<ScattermapChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ScattermapChartPreact, props),
});
