import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ScatterChart as ScatterChartPreact } from '@sisense/sdk-ui-preact';
import type { ScatterChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

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
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {ScatterChart, type ScatterChartProps} from '@sisense/sdk-ui-vue';
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
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: Object as PropType<ScatterChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<ScatterChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<ScatterChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<ScatterChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ScatterChartProps['onBeforeRender']>,
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
