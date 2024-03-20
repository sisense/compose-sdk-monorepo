import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ChartWidget as ChartWidgetPreact } from '@sisense/sdk-ui-preact';
import type { ChartWidgetProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';
import type { Chart } from '../charts';
import type DrilldownWidget from '../drilldown-widget.vue';

/**
 * The Chart Widget component extending the {@link Chart} component to support widget style options.
 * It can be used along with the {@link DrilldownWidget} component to support advanced data drilldown.
 * @example
 * Here's how you can use the ChartWidget component in a Vue application:
 * ```vue
 * <template>
    <DrilldownWidget :drilldownDimensions="drilldownDimensions" :initialDimension="dimProductName">
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
 * import {ChartWidget} from '@sisense/sdk-ui-vue';

 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const chartWidgetProps = ref({
 *   // Configure your ChartWidgetProps here
 * });
 * </script>
 * ```
 * <img src="media://chart-widget-with-drilldown-example-1.png" width="800px" />
 * @param props - ChartWidget properties
 * @returns ChartWidget component representing a chart type as specified in `ChartWidgetProps.`{@link ChartWidgetProps.chartType | chartType}
 * @group Chart Utilities
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
