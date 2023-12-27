import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { FunnelChart as FunnelChartPreact } from '@sisense/sdk-ui-preact';
import type { FunnelChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the FunnelChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the FunnelChart.
 *
 * @example
 * Here's how you can use the FunnelChart component in a Vue application:
 * ```vue
 * <template>
 *   <FunnelChart :props="funnelChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import FunnelChart from '@sisense/sdk-ui-vue/FunnelChart';
 *
 * const funnelChartProps = ref({
 *   // Configure your FunnelChartProps here
 * });
 * </script>
 * ```
 */
export const FunnelChart = defineComponent({
  props: {
    dataOptions: Object as PropType<FunnelChartProps['dataOptions']>,
    dataSet: Object as PropType<FunnelChartProps['dataSet']>,
    filters: Object as PropType<FunnelChartProps['filters']>,
    highlights: Object as PropType<FunnelChartProps['highlights']>,
    onBeforeRender: Function as PropType<FunnelChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<FunnelChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<FunnelChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<FunnelChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<FunnelChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(FunnelChartPreact, props),
});
