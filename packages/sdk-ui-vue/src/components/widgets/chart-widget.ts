import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ChartWidget as ChartWidgetPreact } from '@sisense/sdk-ui-preact';
import type { ChartWidgetProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';
import type { Chart } from '../charts';

// Note: uses direct reexport as a temporary workaround for getting the correct API docs
export { ChartWidgetProps };

/**
 * The Chart Widget component extending the {@link Chart} component to support widget style options.
 * It can be used along with the {@link DrilldownWidget} component to support advanced data drilldown.
 * @example
 * Here's how you can use the ChartWidget component in a Vue application:
 * ```vue
 * <template>
    <DrilldownWidget :drilldownPaths="drilldownPaths" :initialDimension="dimProductName">
      <template
        #chart="{ drilldownFilters, drilldownDimension, onDataPointsSelected, onContextMenu }"
      >
        <ChartWidget
          chart-type="bar"
          v-bind:filters="drilldownFilters"
          :dataOptions="{
            ...chartProps.dataOptions,
            category: [drilldownDimension],
          }"
          :highlight-selection-disabled="true"
          :dataSet="chartProps.dataSet"
          :style="chartProps.styleOptions"
          :on-data-points-selected="(dataPoints:any,event:any) => {
          onDataPointsSelected(dataPoints);
          onContextMenu({ left: event.clientX, top: event.clientY });
        }"
          :on-data-point-click="(dataPoint:any,event:any) => {
          onDataPointsSelected([dataPoint]);
          onContextMenu({ left: event.clientX, top: event.clientY });
        }"
          :on-data-point-context-menu="(dataPoint:any,event:any) => {
          onDataPointsSelected([dataPoint]);
          onContextMenu({ left: event.clientX, top: event.clientY });
        }"
        />
      </template>
    </DrilldownWidget>
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { ChartWidget } from '@sisense/sdk-ui-vue';

 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const chartWidgetProps = ref({
 *   // Configure your ChartWidgetProps here
 * });
 * </script>
 * ```
 * <img src="media://vue-widget-example.png" width="800px" />
 * @param props - ChartWidget properties
 * @returns ChartWidget component representing a chart type as specified in `ChartWidgetProps.`{@link ChartWidgetProps.chartType | chartType}
 * @group Dashboards
 */
export const ChartWidget = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.bottomSlot}
     *
     * @category Widget
     * @internal
     */
    bottomSlot: Object as PropType<ChartWidgetProps['bottomSlot']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.chartType}
     *
     * @category Chart
     */
    chartType: {
      type: String as PropType<ChartWidgetProps['chartType']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.contextMenuItems}
     *
     * @category Widget
     * @internal
     */
    contextMenuItems: Array as PropType<ChartWidgetProps['contextMenuItems']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ChartWidgetProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataSource}
     *
     * @category Data
     */
    dataSource: [String, Object] as PropType<ChartWidgetProps['dataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.description}
     *
     * @category Widget
     */
    description: String as PropType<ChartWidgetProps['description']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.drilldownOptions}
     *
     * @category Widget
     * @internal
     */
    drilldownOptions: Object as PropType<ChartWidgetProps['drilldownOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.filters}
     *
     * @category Data
     */
    filters: [Array, Object] as PropType<ChartWidgetProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlightSelectionDisabled}
     *
     * @category Widget
     */
    highlightSelectionDisabled: Boolean as PropType<ChartWidgetProps['highlightSelectionDisabled']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ChartWidgetProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ChartWidgetProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenuClose}
     *
     * @category Callbacks
     * @internal
     */
    onContextMenuClose: Function as PropType<ChartWidgetProps['onContextMenuClose']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ChartWidgetProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ChartWidgetProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ChartWidgetProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.styleOptions}
     *
     * @category Widget
     */
    styleOptions: Object as PropType<ChartWidgetProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.title}
     *
     * @category Widget
     */
    title: String as PropType<ChartWidgetProps['title']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.topSlot}
     *
     * @category Widget
     * @internal
     */
    topSlot: Object as PropType<ChartWidgetProps['topSlot']>,
    // TODO Remove this prop as part of https://sisense.dev/guides/sdk/guides/migration-guide-1.0.0.html#removed
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.styleOptions}
     * @category Widget
     * @internal
     */
    widgetStyleOptions: Object as PropType<ChartWidgetProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ChartWidgetProps['onDataReady']>,
  },
  setup: (props) => setupHelper(ChartWidgetPreact, props),
});
