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
 * Here's how you can use the CalendarHeatmapChart component in a Vue application:
 * ```vue
 * <template>
 * <CalendarHeatmapChart
      :dataOptions="calendarChartProps.dataOptions"
      :dataSet="calendarChartProps.dataSet"
      :filters="calendarChartProps.filters"
      :styleOptions="calendarChartProps.styleOptions"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { CalendarHeatmapChart, type CalendarHeatmapChartProps } from '@sisense/sdk-ui-vue';
 *
 * const calendarChartProps = ref<CalendarHeatmapChartProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     date: DM.DimDate.Date.Days,
 *     value: measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue'),
 *   },
 *   styleOptions: {
 *     viewType: 'quarter',
 *   },
 *   filters: [],
 * });
 * </script>
 * ```
 * <img src="media://vue-calendar-heatmap-chart-example.png" width="800"/>
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
