import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { PivotTable as PivotTablePreact } from '@sisense/sdk-ui-preact';
import type { PivotTableProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * TBU
 * A Vue component that wraps the PivotTable Preact component for use in Vue applications.
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
 *
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
