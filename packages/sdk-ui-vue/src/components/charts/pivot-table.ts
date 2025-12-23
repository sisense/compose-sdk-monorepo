import { PivotTable as PivotTablePreact } from '@sisense/sdk-ui-preact';
import type { PivotTableProps } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

// Note: uses direct reexport as a temporary workaround for getting the correct API docs
export { PivotTableProps };

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
 * import { PivotTable, type PivotTableProps } from '@sisense/sdk-ui-vue';
 * import * as DM from '../assets/sample-retail-model';
 *
 * const dimCategoryName = DM.DimProducts.CategoryName;
 * const dimColor = DM.DimProducts.Color;
 * const dimProductName = DM.DimProducts.ProductName;
 * const measureTotalRevenue = measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue');
 *
 * const pivotTableProps = ref<PivotTableProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     rows: [dimProductName, dimColor],
 *     columns: [dimCategoryName],
 *     values: [measureTotalRevenue],
 *   },
 *   styleOptions: {
 *     width: 1200,
 *     height: 500,
 *   },
 *   filters: [filterFactory.topRanking(dimProductName, measureTotalRevenue, 1000)],
 * });
 *
 * </script>
 * ```
 * <img src="media://vue-pivot-table-example.png" width="800px" />
 *
 * @remarks
 * Configuration options can also be applied within the scope of a `<SisenseContextProvider>` to control the default behavior of PivotTable, by changing available settings within `appConfig.chartConfig.tabular.*`
 *
 * Follow the link to {@link AppConfig} for more details on the available settings.
 *
 * @group Data Grids
 */
export const PivotTable = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableProps.dataOptions}
     *
     * @category Data
     */
    dataOptions: {
      type: Object as PropType<PivotTableProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<PivotTableProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<PivotTableProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<PivotTableProps['highlights']>,
    /** @internal */
    refreshCounter: Number as PropType<PivotTableProps['refreshCounter']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableProps.styleOptions}
     *
     * @category Representation
     */
    styleOptions: Object as PropType<PivotTableProps['styleOptions']>,
  },
  setup: (props) => setupHelper(PivotTablePreact, props),
});
