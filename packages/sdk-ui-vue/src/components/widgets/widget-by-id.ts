import { WidgetById as WidgetByIdPreact } from '@sisense/sdk-ui-preact';
import type { WidgetByIdProps as WidgetByIdPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';
import type { ChartWidget } from './chart-widget';

/**
 * Props of the {@link @sisense/sdk-ui-vue!WidgetById | `WidgetById`} component.
 */
export interface WidgetByIdProps extends WidgetByIdPropsPreact {}

/**
 * The `WidgetById` component, which is a thin wrapper on the {@link ChartWidget} component,
 * used to render a widget created in the Sisense instance.
 *
 * **Note:** Widget extensions based on JS scripts and add-ons in Fusion are not supported.
 *
 * @example
 * Here's how you can use the WidgetById component in a Vue application:
 * ```vue
 * <template>
 *    <WidgetById
 *      widgetOid="64473e07dac1920034bce77f"
 *      dashboardOid="6441e728dac1920034bce737"
 *    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { WidgetById } from '@sisense/sdk-ui-vue';
 *
 * </script>
 * ```
 * @group Fusion Assets
 * @fusionEmbed
 */
export const WidgetById = defineComponent({
  props: {
    /** @internal */
    bottomSlot: Object as PropType<WidgetByIdProps['bottomSlot']>,
    /** @internal */
    contextMenuItems: Array as PropType<WidgetByIdProps['contextMenuItems']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.dashboardOid}
     *
     * @category Widget
     */
    dashboardOid: {
      type: String as PropType<WidgetByIdProps['dashboardOid']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.description}
     *
     * @category Widget
     */
    description: String as PropType<WidgetByIdProps['description']>,
    /** @internal */
    drilldownOptions: Object as PropType<WidgetByIdProps['drilldownOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.filters}
     *
     * @category Data
     */
    filters: [Array, Object] as PropType<WidgetByIdProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.filtersMergeStrategy}
     *
     * @category Data
     */
    filtersMergeStrategy: Object as PropType<WidgetByIdProps['filtersMergeStrategy']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.highlightSelectionDisabled}
     *
     * @category Widget
     */
    highlightSelectionDisabled: Boolean as PropType<WidgetByIdProps['highlightSelectionDisabled']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<WidgetByIdProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.includeDashboardFilters}
     *
     * @category Data
     */
    includeDashboardFilters: Boolean as PropType<WidgetByIdProps['includeDashboardFilters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<WidgetByIdProps['onBeforeRender']>,
    /** @internal */
    onContextMenuClose: Function as PropType<WidgetByIdProps['onContextMenuClose']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<WidgetByIdProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<WidgetByIdProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<WidgetByIdProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.styleOptions}
     *
     * @category Widget
     */
    styleOptions: Object as PropType<WidgetByIdProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.title}
     *
     * @category Widget
     */
    title: String as PropType<WidgetByIdProps['title']>,
    /** @internal */
    topSlot: Object as PropType<WidgetByIdProps['topSlot']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.widgetOid}
     *
     * @category Widget
     */
    widgetOid: {
      type: String as PropType<WidgetByIdProps['widgetOid']>,
      required: true,
    },
    /** @internal */
    widgetStyleOptions: Object as PropType<WidgetByIdProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!WidgetByIdProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<WidgetByIdProps['onDataReady']>,
  },
  setup: (props) => setupHelper(WidgetByIdPreact, props),
});
