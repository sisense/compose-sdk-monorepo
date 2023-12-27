import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreaChart as AreaChartPreact } from '@sisense/sdk-ui-preact';
import type { AreaChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the AreaChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the AreaChart.
 *
 * @example
 * Here's how you can use the AreaChart component in a Vue application:
 * ```vue
 * <template>
 *   <AreaChart :props="areaChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import AreaChart from '@sisense/sdk-ui-vue/AreaChart';
 *
 * const areaChartProps = ref({
 *   // Configure your AreaChartProps here
 * });
 * </script>
 * ```
 */
export const AreaChart = defineComponent({
  props: {
    dataOptions: Object as PropType<AreaChartProps['dataOptions']>,
    dataSet: Object as PropType<AreaChartProps['dataSet']>,
    filters: Object as PropType<AreaChartProps['filters']>,
    highlights: Object as PropType<AreaChartProps['highlights']>,
    onBeforeRender: Function as PropType<AreaChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<AreaChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<AreaChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<AreaChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<AreaChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(AreaChartPreact, props),
});
