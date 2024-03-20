import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { PivotTable as PivotTablePreact } from '@sisense/sdk-ui-preact';
import type { PivotTableProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component for Pivot table with pagination.
 *
 * @example
 * Here's how you can use the PivotTable component in a Vue application:
 * ```vue
 * <template>
    <PivotTable :dataOptions="pivotTableProps.dataOptions" :dataSet="pivotTableProps.dataSet"
        :styleOptions="pivotTableProps.styleOptions" :filters="pivotTableProps.filters" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import {PivotTable, type PivotTableProps} from '@sisense/sdk-ui-vue/Table';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
const pivotTableProps = ref<PivotTableProps>({
  dataSet: DM.DataSource,
  dataOptions: {
    rows: [dimProductName, dimColor],
    columns: [dimCategoryName],
    values: [measureTotalRevenue],
  },
  styleOptions: {
    width: 1200,
    height: 500,
  },
  filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 1000)],
});
 * </script>
 * ```
 * <img src="media://vue-pivot-table-example.png" width="800px" />
 * @group Data Grids
 * @alpha
 */
export const PivotTable = defineComponent({
  props: {
    dataOptions: Object as PropType<PivotTableProps['dataOptions']>,
    dataSet: Object as PropType<PivotTableProps['dataSet']>,
    filters: Array as PropType<PivotTableProps['filters']>,
    refreshCounter: Number as PropType<PivotTableProps['refreshCounter']>,
    styleOptions: Object as PropType<PivotTableProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PivotTablePreact, props),
});
