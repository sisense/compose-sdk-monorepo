import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { FunnelChart as FunnelChartPreact } from '@sisense/sdk-ui-preact';
import type { FunnelChartProps as FunnelChartPropsPreact } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!FunnelChart | `FunnelChart`} component.
 */
export interface FunnelChartProps extends FunnelChartPropsPreact {}

/**
 * A Vue component that wraps the FunnelChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the FunnelChart.
 *
 * @example
 * Here's how you can use the FunnelChart component in a Vue application:
 * ```vue
 * <template>
    <FunnelChart
      :dataOptions="funnelChartProps.dataOptions"
      :dataSet="funnelChartProps.dataSet"
      :filters="funnelChartProps.filters"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { FunnelChart, type FunnelChartProps } from '@sisense/sdk-ui-vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 *
 * const funnelChartProps = ref<FunnelChartProps>({
  dataSet: DM.DataSource,
  dataOptions: {
    category: [dimProductName],
    value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
  },
  filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
});
 * </script>
 * ```
 * <img src="media://vue-funnel-chart-example.png" width="800"/>
 *
 * Note that the chart sorts the measure, `Unique Users`, in descending order by default.
 * @param props - Funnel chart properties
 * @returns Funnel Chart component
 * @group Charts
 */
export const FunnelChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: Object as PropType<FunnelChartProps['dataOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: Object as PropType<FunnelChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.filters}
     *
     * @category Data
     */
    filters: Object as PropType<FunnelChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.highlights}
     *
     * @category Data
     */
    highlights: Object as PropType<FunnelChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<FunnelChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataReady}
     *
     * @category Callbacks
     * @internal
     */
    onDataReady: Function as PropType<FunnelChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<FunnelChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<FunnelChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<FunnelChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<FunnelChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(FunnelChartPreact, props as FunnelChartPropsPreact),
});
