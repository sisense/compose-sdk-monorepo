import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { TreemapChart as TreemapChartPreact } from '@sisense/sdk-ui-preact';
import type { TreemapChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the TreemapChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the TreemapChart.
 *
 * @example
 * Here's how you can use the TreemapChart component in a Vue application:
 * ```vue
 * <template>
 *   <TreemapChart :props="treemapChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import TreemapChart from '@sisense/sdk-ui-vue/TreemapChart';
 *
 * const treemapChartProps = ref({
 *   // Configure your TreemapChartProps here
 * });
 * </script>
 * ```
 */
export const TreemapChart = defineComponent({
  props: {
    dataOptions: Object as PropType<TreemapChartProps['dataOptions']>,
    dataSet: Object as PropType<TreemapChartProps['dataSet']>,
    filters: Object as PropType<TreemapChartProps['filters']>,
    highlights: Object as PropType<TreemapChartProps['highlights']>,
    onBeforeRender: Function as PropType<TreemapChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<TreemapChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<TreemapChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<TreemapChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<TreemapChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(TreemapChartPreact, props),
});
