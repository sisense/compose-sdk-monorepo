import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ScatterChart as ScatterChartPreact } from '@ethings-os/sdk-ui-preact';
import type { ScatterChartProps as ScatterChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!ScatterChart | `ScatterChart`} component.
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
 * Here's how you can use the ScatterChart component in a Vue application:
 * ```vue
 * <template>
      <ScatterChart
        :dataOptions="scatterChartProps.dataOptions"
        :dataSet="scatterChartProps.dataSet"
        :filters="scatterChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { ScatterChart, type ScatterChartProps } from '@ethings-os/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const scatterChartProps = ref<ScatterChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      x: dimProductName,
      y: measureTotalRevenue,
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://vue-scatter-chart-example.png" width="800px" />
 * @param props - Scatter chart properties
 * @returns Scatter Chart component
 * @group Charts
 */
export const ScatterChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<ScatterChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ScatterChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ScatterChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ScatterChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ScatterChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ScatterChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ScatterChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ScatterChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ScatterChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ScatterChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ScatterChartPreact, props),
});
