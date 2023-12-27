import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { IndicatorChart as IndicatorChartPreact } from '@sisense/sdk-ui-preact';
import type { IndicatorChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the IndicatorChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the IndicatorChart.
 *
 * @example
 * Here's how you can use the IndicatorChart component in a Vue application:
 * ```vue
 * <template>
 *   <IndicatorChart :props="indicatorChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import IndicatorChart from '@sisense/sdk-ui-vue/IndicatorChart';
 *
 * const indicatorChartProps = ref({
 *   // Configure your IndicatorChartProps here
 * });
 * </script>
 * ```
 */
export const IndicatorChart = defineComponent({
  props: {
    dataOptions: Object as PropType<IndicatorChartProps['dataOptions']>,
    dataSet: Object as PropType<IndicatorChartProps['dataSet']>,
    filters: Object as PropType<IndicatorChartProps['filters']>,
    highlights: Object as PropType<IndicatorChartProps['highlights']>,
    styleOptions: Object as PropType<IndicatorChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(IndicatorChartPreact, props),
});
