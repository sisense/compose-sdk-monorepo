import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { WidgetById as WidgetByIdPreact } from '@ethings-os/sdk-ui-preact';
import type { WidgetByIdProps as WidgetByIdPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';
import type { ChartWidget } from './chart-widget';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!WidgetById | `WidgetById`} component.
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
 * import { WidgetById } from '@ethings-os/sdk-ui-vue';
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
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.dashboardOid}
     *
     * @category Widget
     */
    dashboardOid: {
      type: String as PropType<WidgetByIdProps['dashboardOid']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.description}
     *
     * @category Widget
     */
    description: String as PropType<WidgetByIdProps['description']>,
    /** @internal */
    drilldownOptions: Object as PropType<WidgetByIdProps['drilldownOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.filters}
     *
     * @category Data
     */
    filters: [Array, Object] as PropType<WidgetByIdProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.filtersMergeStrategy}
     *
     * @category Data
     */
    filtersMergeStrategy: Object as PropType<WidgetByIdProps['filtersMergeStrategy']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.highlightSelectionDisabled}
     *
     * @category Widget
     */
    highlightSelectionDisabled: Boolean as PropType<WidgetByIdProps['highlightSelectionDisabled']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<WidgetByIdProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.includeDashboardFilters}
     *
     * @category Data
     */
    includeDashboardFilters: Boolean as PropType<WidgetByIdProps['includeDashboardFilters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<WidgetByIdProps['onBeforeRender']>,
    /** @internal */
    onContextMenuClose: Function as PropType<WidgetByIdProps['onContextMenuClose']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<WidgetByIdProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<WidgetByIdProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<WidgetByIdProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.styleOptions}
     *
     * @category Widget
     */
    styleOptions: Object as PropType<WidgetByIdProps['styleOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.title}
     *
     * @category Widget
     */
    title: String as PropType<WidgetByIdProps['title']>,
    /** @internal */
    topSlot: Object as PropType<WidgetByIdProps['topSlot']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.widgetOid}
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
     * {@inheritDoc @ethings-os/sdk-ui!WidgetByIdProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<WidgetByIdProps['onDataReady']>,
  },
  setup: (props) => setupHelper(WidgetByIdPreact, props),
});
