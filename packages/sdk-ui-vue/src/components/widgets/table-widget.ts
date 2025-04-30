import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { TableWidget as TableWidgetPreact, type TableWidgetProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

// Note: uses direct reexport as a temporary workaround for getting the correct API docs
export { TableWidgetProps };

/**
 * The TableWidget component extending the Table component to support widget style options.
 *
 * @example
 * Here's how you can use the TableWidget component in a Vue application:
 * ```vue
 * <template>
 *   <TableWidget :props="tableWidgetProps" />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import TableWidget from '@sisense/sdk-ui-vue/TableWidget';
 *
 * const tableWidgetProps = ref({
 *   // Configure your TableWidgetProps here
 * });
 * </script>
 * ```
 * <img src="media://vue-table-widget-example.png" width="600px" />
 * @param props - Table Widget properties
 * @returns Widget component representing a table
 * @internal
 */
export const TableWidget = defineComponent({
  props: {
    bottomSlot: Object as PropType<TableWidgetProps['bottomSlot']>,
    dataOptions: {
      type: Object as PropType<TableWidgetProps['dataOptions']>,
      required: true,
    },
    dataSource: [String, Object] as PropType<TableWidgetProps['dataSource']>,
    description: String as PropType<TableWidgetProps['description']>,
    filters: [Object, Array] as PropType<TableWidgetProps['filters']>,
    styleOptions: Object as PropType<TableWidgetProps['styleOptions']>,
    title: String as PropType<TableWidgetProps['title']>,
    topSlot: Object as PropType<TableWidgetProps['topSlot']>,
    widgetStyleOptions: Object as PropType<TableWidgetProps['styleOptions']>,
  },
  setup: (props) => setupHelper(TableWidgetPreact, props),
});
