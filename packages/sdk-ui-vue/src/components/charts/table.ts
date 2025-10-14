import { Table as TablePreact } from '@sisense/sdk-ui-preact';
import type { TableProps } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

// Note: uses direct reexport as a temporary workaround for getting the correct API docs
export { TableProps };

/**
 * Table with aggregation and pagination.
 *
 * @example
 * Here's how you can use the Table component in a Vue application:
 * ```vue
 * <template>
 *  <Table :dataOptions="tableProps.dataOptions" :dataSet="tableProps.dataSet"
      :styleOptions="tableProps.styleOptions" :filters="tableProps.filters" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { Table, type TableProps } from '@sisense/sdk-ui-vue';
 *
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 *
 *  const tableProps = ref<TableProps>({
      dataSet: DM.DataSource,
      dataOptions: {
        columns: [dimProductName, measureTotalRevenue],
      },
      styleOptions: {
        width: 800,
        height: 500,
      },
      filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 10)],
 *  });
 * </script>
 * ```
 * <img src="media://vue-table-example.png" width="800px" />
 * @param props - Table properties
 * @returns Table component
 * @group Data Grids
 */
export const Table = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!TableProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<TableProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!TableProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<TableProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TableProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<TableProps['filters']>,
    /** @internal */
    refreshCounter: Number as PropType<TableProps['refreshCounter']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TableProps.styleOptions}
     *
     * @category Representation
     */
    styleOptions: Object as PropType<TableProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TableProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<TableProps['onDataReady']>,
  },
  setup: (props) => setupHelper(TablePreact, props),
});
