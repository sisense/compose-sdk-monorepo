import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { BoxplotChart as BoxplotChartPreact } from '@ethings-os/sdk-ui-preact';
import type { BoxplotChartProps as BoxplotChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!BoxplotChart | `BoxplotChart`} component.
 */
export interface BoxplotChartProps extends BoxplotChartPropsPreact {}

/**
 * A Vue component representing data in a way that visually describes the distribution, variability,
 * and center of a data set along an axis.
 *
 * @example
 * Here's how you can use the BoxplotChart component in a Vue application:
 * ```vue
 * <template>
    <BoxplotChart
        :dataOptions="boxplotChartProps.dataOptions"
        :dataSet="boxplotChartProps.dataSet"
        :filters="boxplotChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { BoxplotChart, type BoxplotChartProps } from '@ethings-os/sdk-ui-vue';

 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const boxplotChartProps = ref<BoxplotChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [DM.Fact_Sale_orders.OrderRevenue],
      boxType: 'iqr',
      outliersEnabled: true,
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://vue-boxplot-chart-example.png" width="600px" />
 * @param props - Boxplot chart properties
 * @returns Boxplot Chart component
 * @group Charts
 */
export const BoxplotChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<BoxplotChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<BoxplotChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<BoxplotChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<BoxplotChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<BoxplotChartProps['styleOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<BoxplotChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<BoxplotChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<BoxplotChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<BoxplotChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<BoxplotChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(BoxplotChartPreact, props),
});
