import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Table as TablePreact } from '@sisense/sdk-ui-preact';
import type { TableProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the Table Preact component for use in Vue applications.
 * It provides a single 'props' prop to pass all the TableProps to the Table Preact component,
 * enabling the use of the table within Vue's reactivity system.
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
