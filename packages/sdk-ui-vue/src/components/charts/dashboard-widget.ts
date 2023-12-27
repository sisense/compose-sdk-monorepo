import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DashboardWidget as DashboardWidgetPreact } from '@sisense/sdk-ui-preact';
import type { DashboardWidgetProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the DashboardWidget Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the DashboardWidget.
 *
 * @example
 * Here's how you can use the DashboardWidget component in a Vue application:
 * ```vue
 * <template>
 *   <DashboardWidget :props="dashboardWidgetProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import DashboardWidget from '@sisense/sdk-ui-vue/DashboardWidget';
 *
 * const dashboardWidgetProps = ref({
 *   // Configure your DashboardWidgetProps here
 * });
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
