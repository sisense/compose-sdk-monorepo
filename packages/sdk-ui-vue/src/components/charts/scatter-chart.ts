import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ScatterChart as ScatterChartPreact } from '@sisense/sdk-ui-preact';
import type { ScatterChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the ScatterChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the ScatterChart.
 *
 * @example
 * Here's how you can use the ScatterChart component in a Vue application:
 * ```vue
 * <template>
 *   <ScatterChart :props="scatterChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import ScatterChart from '@sisense/sdk-ui-vue/ScatterChart';
 *
 * const scatterChartProps = ref({
 *   // Configure your ScatterChartProps here
 * });
 * </script>
 * ```
 */
export const ScatterChart = defineComponent({
  props: {
    dataOptions: Object as PropType<ScatterChartProps['dataOptions']>,
    dataSet: Object as PropType<ScatterChartProps['dataSet']>,
    filters: Object as PropType<ScatterChartProps['filters']>,
    highlights: Object as PropType<ScatterChartProps['highlights']>,
    onBeforeRender: Function as PropType<ScatterChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<ScatterChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<ScatterChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<ScatterChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<ScatterChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ScatterChartPreact, props),
});
