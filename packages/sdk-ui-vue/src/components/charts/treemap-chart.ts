import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { TreemapChart as TreemapChartPreact } from '@sisense/sdk-ui-preact';
import type { TreemapChartProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component displaying hierarchical data in the form of nested rectangles.
 *
 * This type of chart can be used instead of a column chart for comparing a large number of categories and sub-categories.
 *
 * @example
 * Here's how you can use the TreemapChart component in a Vue application:
 * ```vue
 * <template>
      <TreemapChart
        :dataOptions="treemapChartProps.dataOptions"
        :dataSet="treemapChartProps.dataSet"
        :filters="treemapChartProps.filters"
      />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {TreemapChart, type TreemapChartProps} from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 * const treemapChartProps = ref<TreemapChartProps>({
    dataSet: DM.DataSource,
    dataOptions: {
      category: [dimProductName],
      value: [{ column: measureTotalRevenue, sortType: 'sortDesc' }],
    },
    filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
  });
 * ```
 * <img src="media://vue-treemap-chart-example.png" width="600px" />
 * @param props - Treemap chart properties
 * @returns Treemap Chart component
 * @group Charts
 */
export const TreemapChart = defineComponent({
  props: {
    dataOptions: Object as PropType<TreemapChartProps['dataOptions']>,
    dataSet: Object as PropType<TreemapChartProps['dataSet']>,
    filters: Object as PropType<TreemapChartProps['filters']>,
    highlights: Object as PropType<TreemapChartProps['highlights']>,
    onBeforeRender: Function as PropType<TreemapChartProps['onBeforeRender']>,
    onDataPointClick: Function as PropType<TreemapChartProps['onDataPointClick']>,
    onDataPointContextMenu: Function as PropType<TreemapChartProps['onDataPointContextMenu']>,
    onDataPointsSelected: Function as PropType<TreemapChartProps['onDataPointsSelected']>,
    styleOptions: Object as PropType<TreemapChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(TreemapChartPreact, props),
});
