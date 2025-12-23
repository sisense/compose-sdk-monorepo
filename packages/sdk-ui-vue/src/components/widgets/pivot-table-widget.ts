import {
  PivotTableWidget as PivotTableWidgetPreact,
  type PivotTableWidgetProps,
} from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

export { PivotTableWidgetProps };

/**
 * The PivotTableWidget component extending the {@link PivotTable} component to support widget style options.
 *
 * @example
 * Here's how you can use the PivotTableWidget component in a Vue application:
 * ```vue
 * <template>
 *   <PivotTableWidget
 *      :dataSource="pivotTableWidgetProps.dataSource"
 *      :filters="pivotTableWidgetProps.filters"
 *      :dataOptions="pivotTableWidgetProps.dataOptions"
 *      :styleOptions="pivotTableWidgetProps.styleOptions"
 *      :title="pivotTableWidgetProps.title"
 *   />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import { PivotTableWidget, type PivotTableWidgetProps } from '@sisense/sdk-ui-vue';
 * import * as DM from '../assets/sample-ecommerce-model';
 *
 * const pivotTableWidgetProps = ref<PivotTableWidgetProps>({
 *   dataSource: DM.DataSource,
 *   dataOptions: {
 *     rows: [DM.Category.Category],
 *     values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
 *   },
 *   filters: [],
 *   title: 'Pivot Table Widget Example',
 *   styleOptions: {
 *     spaceAround: 'Medium',
 *     cornerRadius: 'Large',
 *     shadow: 'Light',
 *     border: true,
 *     borderColor: '#e0e0e0',
 *     backgroundColor: '#ffffff',
 *     header: {
 *       hidden: false,
 *       titleTextColor: '#333333',
 *       titleAlignment: 'Center',
 *       dividerLine: true,
 *       dividerLineColor: '#e0e0e0',
 *       backgroundColor: '#f5f5f5',
 *     },
 *   },
 * });
 * </script>
 * ```
 * <img src="media://vue-pivot-table-widget-example.png" width="600px" />
 * @param props - Pivot Table Widget properties
 * @returns Widget component representing a pivot table
 * @group Dashboards
 */
export const PivotTableWidget = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<PivotTableWidgetProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.dataSource}
     *
     * @category Data
     */
    dataSource: [String, Object] as PropType<PivotTableWidgetProps['dataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.description}
     *
     * @category Widget
     */
    description: String as PropType<PivotTableWidgetProps['description']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<PivotTableWidgetProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.styleOptions}
     *
     * @category Widget
     */
    styleOptions: Object as PropType<PivotTableWidgetProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.title}
     *
     * @category Widget
     */
    title: String as PropType<PivotTableWidgetProps['title']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.topSlot}
     *
     * @category Widget
     * @internal
     */
    topSlot: Object as PropType<PivotTableWidgetProps['topSlot']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.bottomSlot}
     *
     * @category Widget
     * @internal
     */
    bottomSlot: Object as PropType<PivotTableWidgetProps['bottomSlot']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<PivotTableWidgetProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.onDataPointClick}
     *
     * @category Callbacks
     * @internal
     */
    onDataPointClick: Function as PropType<PivotTableWidgetProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.onDataPointContextMenu}
     *
     * @category Callbacks
     * @internal
     */
    onDataPointContextMenu: Function as PropType<PivotTableWidgetProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.onDataCellFormat}
     *
     * @category Callbacks
     * @internal
     */
    onDataCellFormat: Function as PropType<PivotTableWidgetProps['onDataCellFormat']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableWidgetProps.onHeaderCellFormat}
     *
     * @category Callbacks
     * @internal
     */
    onHeaderCellFormat: Function as PropType<PivotTableWidgetProps['onHeaderCellFormat']>,
  },
  setup: (props) => setupHelper(PivotTableWidgetPreact, props),
});
