import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreamapChart as AreamapChartPreact } from '@sisense/sdk-ui-preact';
import type { AreamapChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the AreamapChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the AreamapChart.
 *
 * @example
 * Here's how you can use the AreamapChart component in a Vue application:
 * ```vue
 * <template>
 *   <AreamapChart :props="areamapChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import AreamapChart from '@sisense/sdk-ui-vue/AreamapChart';
 *
 * const areamapChartProps = ref({
 *   // Configure your AreamapChartProps here
 * });
 * </script>
 * ```
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
