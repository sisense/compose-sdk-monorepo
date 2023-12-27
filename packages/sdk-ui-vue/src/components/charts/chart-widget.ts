import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ChartWidget as ChartWidgetPreact } from '@sisense/sdk-ui-preact';
import type { ChartWidgetProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the ChartWidget Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the ChartWidget.
 *
 * @example
 * Here's how you can use the ChartWidget component in a Vue application:
 * ```vue
 * <template>
 *   <ChartWidget :props="chartWidgetProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import ChartWidget from '@sisense/sdk-ui-vue/ChartWidget';
 *
 * const chartWidgetProps = ref({
 *   // Configure your ChartWidgetProps here
 * });
 * </script>
 * ```
 */
export const ChartWidget = defineComponent({
  props: {
    bottomSlot: Object as PropType<ChartWidgetProps['bottomSlot']>,
    chartType: String as PropType<ChartWidgetProps['chartType']>,
    contextMenuItems: Array as PropType<ChartWidgetProps['contextMenuItems']>,
    dataOptions: Object as PropType<ChartWidgetProps['dataOptions']>,
    dataSource: Object as PropType<ChartWidgetProps['dataSource']>,
    description: String as PropType<ChartWidgetProps['description']>,
    drilldownOptions: Object as PropType<ChartWidgetProps['drilldownOptions']>,
    filters: Array as PropType<ChartWidgetProps['filters']>,
    highlightSelectionDisabled: Boolean as PropType<ChartWidgetProps['highlightSelectionDisabled']>,
    highlights: Array as PropType<ChartWidgetProps['highlights']>,
    onBeforeRender: Function as PropType<ChartWidgetProps['onBeforeRender']>,
    onContextMenuClose: Function as PropType<ChartWidgetProps['onContextMenuClose']>,
    onDataPointClick: Function as PropType<ChartWidgetProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<ChartWidgetProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<ChartWidgetProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<ChartWidgetProps['styleOptions']>,
    title: String as PropType<ChartWidgetProps['title']>,
    topSlot: Object as PropType<ChartWidgetProps['topSlot']>,
    widgetStyleOptions: Object as PropType<ChartWidgetProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ChartWidgetPreact, props),
});
