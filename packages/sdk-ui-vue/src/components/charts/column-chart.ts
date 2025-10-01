import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ColumnChart as ColumnChartPreact } from '@ethings-os/sdk-ui-preact';
import type { ColumnChartProps as ColumnChartPropsPreact } from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!ColumnChart | `ColumnChart`} component.
 */
export interface ColumnChartProps extends ColumnChartPropsPreact {}

/**
 * A Vue component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 *
 * @example
 * Here's how you can use the ColumnChart component in a Vue application:
 * ```vue
 * <template>
      <ColumnChart
        :dataOptions="columnChartProps.dataOptions"
        :dataSet="columnChartProps.dataSet"
        :filters="columnChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@ethings-os/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { ColumnChart, type ColumnChartProps } from '@ethings-os/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');

const columnChartProps = ref<ColumnChartProps>({
  dataSet: DM.DataSource,
  dataOptions: {
    category: [dimProductName],
    value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
    breakBy: [],
  },
  filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
});
 * ```
 * <img src="media://vue-column-chart-example.png" width="800"/>
 * @param props - Column chart properties
 * @returns Column Chart component
 * @group Charts
 */
export const ColumnChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ColumnChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ColumnChartProps['dataSet']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ColumnChartProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ColumnChartProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ColumnChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ColumnChartProps['onDataReady']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ColumnChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ColumnChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ColumnChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ColumnChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ColumnChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ColumnChartPreact, props),
});
