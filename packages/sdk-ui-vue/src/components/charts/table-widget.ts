import { defineComponent, type Prop } from 'vue';
import { TableWidget as TableWidgetPreact, type TableWidgetProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Vue component that wraps the TableWidget Preact component for use in Vue applications.
 * It uses a single 'props' prop to pass all TableWidgetProps to the TableWidgetPreact component.
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
 */
export const TableWidget = defineComponent({
  props: {
    bottomSlot: Object as Prop<TableWidgetProps['bottomSlot']>,
    dataOptions: Object as Prop<TableWidgetProps['dataOptions']>,
    dataSource: String as Prop<TableWidgetProps['dataSource']>,
    description: String as Prop<TableWidgetProps['description']>,
    filters: Object as Prop<TableWidgetProps['filters']>,
    styleOptions: Object as Prop<TableWidgetProps['styleOptions']>,
    title: String as Prop<TableWidgetProps['title']>,
    topSlot: Object as Prop<TableWidgetProps['topSlot']>,
    widgetStyleOptions: Object as Prop<TableWidgetProps['styleOptions']>,
  },
  setup: (props) => setupHelper(TableWidgetPreact, props),
});
