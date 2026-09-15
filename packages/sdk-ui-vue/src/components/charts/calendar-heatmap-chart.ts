import { CalendarHeatmapChart as CalendarHeatmapChartPreact } from '@sisense/sdk-ui-preact';
import type { CalendarHeatmapChartProps as CalendarHeatmapChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!CalendarHeatmapChart | `CalendarHeatmapChart`} component.
 */
export interface CalendarHeatmapChartProps extends CalendarHeatmapChartPropsPreact {}

/**
 * A Vue component that visualizes values over days in a calendar-like view,
 * making it easy to identify daily patterns or anomalies
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { CalendarHeatmapChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     date: DM.Commerce.Date.Days,
 *     value: { column: measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity') },
 *   },
 *   styleOptions: { viewType: 'quarter' as const },
 * });
 * </script>
 *
 * <template>
 *   <CalendarHeatmapChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://calendar-heatmap-chart-example-1.png" width="700px" />
 * @param {CalendarHeatmapChartProps} - Calendar heatmap chart properties
 * @returns Calendar Heatmap Chart component
 * @group Charts
 */
export const CalendarHeatmapChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<CalendarHeatmapChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<CalendarHeatmapChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<CalendarHeatmapChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<CalendarHeatmapChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<CalendarHeatmapChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<CalendarHeatmapChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<CalendarHeatmapChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<CalendarHeatmapChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<
      CalendarHeatmapChartProps['onDataPointContextMenu']
    >,
    /**
     * {@inheritDoc @sisense/sdk-ui!CalendarHeatmapChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<CalendarHeatmapChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(CalendarHeatmapChartPreact, props),
});
