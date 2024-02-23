import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Table as TablePreact } from '@sisense/sdk-ui-preact';
import type { TableProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * Table with aggregation and pagination.
 *
 * @example
 * Here's how you can use the Table component in a Vue application:
 * ```vue
 * <template>
 *   <Table :props="tableProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import Table from '@sisense/sdk-ui-vue/Table';
 *
 * const tableProps = ref({
 *   // Define your TableProps configuration here
 * });
 * </script>
 * ```
 * <img src="media://table-example-2.png" width="800px" />
 * @param props - Table properties
 * @returns Table component
 */
export const Table = defineComponent({
  props: {
    dataOptions: Object as PropType<TableProps['dataOptions']>,
    dataSet: Object as PropType<TableProps['dataSet']>,
    filters: Array as PropType<TableProps['filters']>,
    refreshCounter: Number as PropType<TableProps['refreshCounter']>,
    styleOptions: Object as PropType<TableProps['styleOptions']>,
  },
  setup: (props) => setupHelper(TablePreact, props),
});
