import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DashboardWidget as DashboardWidgetPreact } from '@sisense/sdk-ui-preact';
import type { DashboardWidgetProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';
import type { ChartWidget } from './chart-widget';

/**
 * The Dashboard Widget component, which is a thin wrapper on the {@link ChartWidget} component,
 * used to render a widget created in the Sisense instance.
 *
 * @example
 * Here's how you can use the DashboardWidget component in a Vue application:
 * ```vue
 * <template>
 *    <DashboardWidget
 *      widgetOid="64473e07dac1920034bce77f"
 *      dashboardOid="6441e728dac1920034bce737"
 *    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import {DashboardWidget} from '@sisense/sdk-ui-vue';
 *
 * </script>
 * ```
 */
export const DashboardWidget = defineComponent({
  props: {
    bottomSlot: Object as PropType<DashboardWidgetProps['bottomSlot']>,
    contextMenuItems: Array as PropType<DashboardWidgetProps['contextMenuItems']>,
    dashboardOid: String as PropType<DashboardWidgetProps['dashboardOid']>,
    description: String as PropType<DashboardWidgetProps['description']>,
    drilldownOptions: Object as PropType<DashboardWidgetProps['drilldownOptions']>,
    filters: Array as PropType<DashboardWidgetProps['filters']>,
    filtersMergeStrategy: Object as PropType<DashboardWidgetProps['filtersMergeStrategy']>,
    highlightSelectionDisabled: Boolean as PropType<
      DashboardWidgetProps['highlightSelectionDisabled']
    >,
    highlights: Array as PropType<DashboardWidgetProps['highlights']>,
    includeDashboardFilters: Boolean as PropType<DashboardWidgetProps['includeDashboardFilters']>,
    onBeforeRender: Function as PropType<DashboardWidgetProps['onBeforeRender']>,
    onContextMenuClose: Function as PropType<DashboardWidgetProps['onContextMenuClose']>,
    onDataPointClick: Function as PropType<DashboardWidgetProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<DashboardWidgetProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<DashboardWidgetProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<DashboardWidgetProps['styleOptions']>,
    title: String as PropType<DashboardWidgetProps['title']>,
    topSlot: Object as PropType<DashboardWidgetProps['topSlot']>,
    widgetOid: String as PropType<DashboardWidgetProps['widgetOid']>,
    widgetStyleOptions: Object as PropType<DashboardWidgetProps['styleOptions']>,
  },
  setup: (props) => setupHelper(DashboardWidgetPreact, props),
});
