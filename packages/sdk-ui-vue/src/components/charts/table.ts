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
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { Table } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const tableProps = ref({
 *   dataOptions: {
 *     columns: [
 *       { column: DM.Commerce.Date.Years, name: 'Year', dateFormat: 'yyyy' },
 *       DM.Commerce.Condition,
 *       measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *     ],
 *   },
 *   styleOptions: {
 *     rowsPerPage: 12,
 *     height: 420,
 *     header: { color: { enabled: true, backgroundColor: '#94F5F0', textColor: '#121A23' } },
 *     rows: { alternatingColor: { enabled: true, backgroundColor: '#f2f2f2' } },
 *   },
 * });
 * </script>
 *
 * <template>
 *   <Table
 *     :dataSet="DM.DataSource"
 *     :dataOptions="tableProps.dataOptions"
 *     :styleOptions="tableProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://table-example-1.png" width="700px" />
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
