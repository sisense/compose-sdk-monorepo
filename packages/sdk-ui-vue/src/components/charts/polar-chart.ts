import { defineComponent, type PropType } from 'vue';
import { PolarChart as PolarChartPreact, type PolarChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the PolarChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the PolarChart.
 *
 * @example
 * Here's how you can use the PolarChart component in a Vue application:
 * ```vue
 * <template>
 *   <PolarChart :props="polarChartProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import PolarChart from '@sisense/sdk-ui-vue/PolarChart';
 *
 * const polarChartProps = ref({
 *   // Configure your PolarChartProps here
 * });
 * </script>
 * ```
 */
export const PolarChart = defineComponent({
  props: {
    dataOptions: Object as PropType<PolarChartProps['dataOptions']>,
    dataSet: Object as PropType<PolarChartProps['dataSet']>,
    filters: Object as PropType<PolarChartProps['filters']>,
    highlights: Object as PropType<PolarChartProps['highlights']>,
    onBeforeRender: Function as PropType<PolarChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<PolarChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<PolarChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<PolarChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<PolarChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PolarChartPreact, props),
});
