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
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
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
 * @group Fusion Embed
 * @fusionEmbed
 */
export const DashboardWidget = defineComponent({
  props: {
    /** @internal */
    bottomSlot: Object as PropType<DashboardWidgetProps['bottomSlot']>,
    /** @internal */
    contextMenuItems: Array as PropType<DashboardWidgetProps['contextMenuItems']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.dashboardOid}
     *
     * @category Widget
     */
    dashboardOid: String as PropType<DashboardWidgetProps['dashboardOid']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.description}
     *
     * @category Widget
     */
    description: String as PropType<DashboardWidgetProps['description']>,
    /** @internal */
    drilldownOptions: Object as PropType<DashboardWidgetProps['drilldownOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.filters}
     *
     * @category Data
     */
    filters: Array as PropType<DashboardWidgetProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.filtersMergeStrategy}
     *
     * @category Data
     */
    filtersMergeStrategy: Object as PropType<DashboardWidgetProps['filtersMergeStrategy']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.highlightSelectionDisabled}
     *
     * @category Widget
     */
    highlightSelectionDisabled: Boolean as PropType<
      DashboardWidgetProps['highlightSelectionDisabled']
    >,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<DashboardWidgetProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.includeDashboardFilters}
     *
     * @category Data
     */
    includeDashboardFilters: Boolean as PropType<DashboardWidgetProps['includeDashboardFilters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<DashboardWidgetProps['onBeforeRender']>,
    /** @internal */
    onContextMenuClose: Function as PropType<DashboardWidgetProps['onContextMenuClose']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<DashboardWidgetProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<DashboardWidgetProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<DashboardWidgetProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.styleOptions}
     *
     * @category Widget
     */
    styleOptions: Object as PropType<DashboardWidgetProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.title}
     *
     * @category Widget
     */
    title: String as PropType<DashboardWidgetProps['title']>,
    /** @internal */
    topSlot: Object as PropType<DashboardWidgetProps['topSlot']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardWidgetProps.widgetOid}
     *
     * @category Widget
     */
    widgetOid: String as PropType<DashboardWidgetProps['widgetOid']>,
    /** @internal */
    widgetStyleOptions: Object as PropType<DashboardWidgetProps['styleOptions']>,
  },
  setup: (props) => setupHelper(DashboardWidgetPreact, props),
});
