import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { AreaChart as AreaChartPreact } from '@sisense/sdk-ui-preact';
import type { AreaChartProps as AreaChartPropsPreact } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!AreaChart | `AreaChart`} component.
 */
export interface AreaChartProps extends AreaChartPropsPreact {}

/**
 * A Vue component similar to a {@link LineChart},
 * but with filled in areas under each line and an option to display them as stacked.
 *
 * @example
 * Here's how you can use the AreaChart component in a Vue application:
 * ```vue
 * <template>
 * <AreaChart
      :dataOptions="areaChartProps.dataOptions"
      :dataSet="areaChartProps.dataSet"
      :filters="areaChartProps.filters"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { AreaChart, type AreaChartProps } from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const areaChartProps = ref<AreaChartProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     category: [dimProductName],
 *     value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
 *     breakBy: [],
 *   },
 *   filters: [],
 * });
 * ```
 * <img src="media://vue-area-chart-example.png" width="800"/>
 * @param {AreaChartProps} - Area chart properties
 * @returns Area Chart component
 * @group Charts
 */
export const AreaChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<AreaChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<AreaChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<AreaChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<AreaChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<AreaChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<AreaChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<AreaChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<AreaChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<AreaChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreaChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<AreaChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(AreaChartPreact, props),
});
