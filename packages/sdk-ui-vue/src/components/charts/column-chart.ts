import { ref, h, defineComponent } from 'vue';
import type { PropType } from 'vue';
import {
  ColumnChart as ColumnChartPreact,
  ComponentAdapter,
  createElement,
} from '@sisense/sdk-ui-preact';
import type { ColumnChartProps } from '@sisense/sdk-ui-preact';
import { createSisenseContextConnector, createThemeContextConnector } from '../../providers';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the ColumnChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the ColumnChart.
 *
 * @example
 * Here's how you can use the ColumnChart component in a Vue application:
 * ```vue
 * <template>
 *   <ColumnChart :props="ColumnChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import ColumnChart from '@sisense/sdk-ui-vue/ColumnChart';
 *
 * const columnChartProps = ref({
 *   // Configure your ColumnChartProps here
 * });
 * </script>
 * ```
 */
export const ColumnChart = defineComponent({
  props: {
    dataOptions: Object as PropType<ColumnChartProps['dataOptions']>,
    dataSet: Object as PropType<ColumnChartProps['dataSet']>,
    filters: Object as PropType<ColumnChartProps['filters']>,
    highlights: Object as PropType<ColumnChartProps['highlights']>,
    onBeforeRender: Function as PropType<ColumnChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<ColumnChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<ColumnChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<ColumnChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<ColumnChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ColumnChartPreact, props),
});
