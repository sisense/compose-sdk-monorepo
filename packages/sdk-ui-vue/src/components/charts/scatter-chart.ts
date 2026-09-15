import { ScatterChart as ScatterChartPreact } from '@sisense/sdk-ui-preact';
import type { ScatterChartProps as ScatterChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!ScatterChart | `ScatterChart`} component.
 */
export interface ScatterChartProps extends ScatterChartPropsPreact {}

/**
 * A Vue component displaying the distribution of two variables on an X-Axis, Y-Axis,
 * and two additional fields of data that are shown as colored circles scattered across the chart.
 *
 * **Point**: A field that for each of its members a scatter point is drawn. The maximum amount of data points is 500.
 *
 * **Size**: An optional field represented by the size of the circles.
 * If omitted, all scatter points are equal in size. If used, the circle sizes are relative to their values.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { ScatterChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     x: DM.Category.CategoryID,
 *     y: measureFactory.sum(DM.Commerce.Revenue),
 *     breakByColor: DM.Commerce.Gender,
 *   },
 *   styleOptions: {
 *     yAxis: { enabled: true, logarithmic: true, title: { enabled: true, text: 'Total Revenue' } },
 *   },
 * });
 * </script>
 *
 * <template>
 *   <ScatterChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://scatter-chart-example-1.png" width="700px" />
 * @param props - Scatter chart properties
 * @returns Scatter Chart component
 * @group Charts
 */
export const ScatterChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<ScatterChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ScatterChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ScatterChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ScatterChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ScatterChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ScatterChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ScatterChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ScatterChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ScatterChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ScatterChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ScatterChartPreact, props),
});
