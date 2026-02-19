import { ColumnChart as ColumnChartPreact } from '@sisense/sdk-ui-preact';
import type { ColumnChartProps as ColumnChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!ColumnChart | `ColumnChart`} component.
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
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { ColumnChart, type ColumnChartProps } from '@sisense/sdk-ui-vue';
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
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ColumnChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ColumnChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ColumnChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ColumnChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ColumnChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ColumnChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ColumnChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ColumnChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ColumnChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ColumnChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ColumnChartPreact, props),
});
