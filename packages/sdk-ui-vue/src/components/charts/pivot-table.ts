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
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { PivotTable } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const pivotTableProps = ref({
 *   dataOptions: {
 *     rows: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *       },
 *       DM.Commerce.Condition,
 *     ],
 *     columns: [DM.Commerce.AgeRange],
 *     values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   },
 *   styleOptions: {
 *     rowsPerPage: 10,
 *     height: 425,
 *     width: 800,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <PivotTable
 *     :dataSet="DM.DataSource"
 *     :dataOptions="pivotTableProps.dataOptions"
 *     :styleOptions="pivotTableProps.styleOptions"
 *   />
 * </template>
 * ```
 *
 * <img src="media://pivot-table-example-1.png" width="800px" />
 *
 * Additional examples:
 *
 * Highlighting relative magnitude within a column with data bars:
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { PivotTable } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const pivotTableProps = ref({
 *   dataOptions: {
 *     rows: [DM.Commerce.Condition, DM.Commerce.AgeRange],
 *     columns: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *       },
 *     ],
 *     values: [
 *       {
 *         column: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *         dataBars: true,
 *       },
 *     ],
 *   },
 *   styleOptions: {
 *     rowsPerPage: 10,
 *     height: 425,
 *     width: 850,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <PivotTable
 *     :dataSet="DM.DataSource"
 *     :dataOptions="pivotTableProps.dataOptions"
 *     :styleOptions="pivotTableProps.styleOptions"
 *   />
 * </template>
 * ```
 *
 * <img src="media://pivot-table-example-2.png" width="800px" />
 *
 * Sorting rows: `Condition` and `Age Range` rows sorted directly by their own values (equivalent to a user clicking a row heading and choosing Sort Descending):
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { PivotTable } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const pivotTableProps = ref({
 *   dataOptions: {
 *     rows: [
 *       {
 *         column: DM.Commerce.Condition,
 *         sortType: 'sortDesc',
 *       },
 *       {
 *         column: DM.Commerce.AgeRange,
 *         sortType: 'sortDesc',
 *       },
 *     ],
 *     columns: [{ column: DM.Commerce.Date.Years }],
 *     values: [
 *       { column: measureFactory.sum(DM.Commerce.Revenue, 'Revenue') },
 *       { column: measureFactory.sum(DM.Commerce.Quantity, 'Units') },
 *     ],
 *   },
 *   styleOptions: {
 *     rowsPerPage: 12,
 *     height: 425,
 *     width: 1200,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <PivotTable
 *     :dataSet="DM.DataSource"
 *     :dataOptions="pivotTableProps.dataOptions"
 *     :styleOptions="pivotTableProps.styleOptions"
 *   />
 * </template>
 * ```
 *
 * <img src="media://pivot-table-example-3.png" width="800px" />
 *
 * Sorting rows by a value column: `Age Range` sorted by its `Revenue` values (equivalent to a user clicking the `Revenue` value heading and sorting `Age Range` Descending):
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { PivotTable } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const pivotTableProps = ref({
 *   dataOptions: {
 *     rows: [
 *       DM.Commerce.Condition,
 *       {
 *         column: DM.Commerce.AgeRange,
 *         sortType: {
 *           direction: 'sortDesc',
 *           by: {
 *             valuesIndex: 0,
 *           },
 *         },
 *       },
 *     ],
 *     values: [
 *       measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
 *       measureFactory.sum(DM.Commerce.Quantity, 'Units'),
 *     ],
 *   },
 *   styleOptions: {
 *     rowsPerPage: 12,
 *     height: 425,
 *     width: 800,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <PivotTable
 *     :dataSet="DM.DataSource"
 *     :dataOptions="pivotTableProps.dataOptions"
 *     :styleOptions="pivotTableProps.styleOptions"
 *   />
 * </template>
 * ```
 *
 * <img src="media://pivot-table-example-4.png" width="800px" />
 *
 * Grand totals across rows and columns:
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { PivotTable } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const pivotTableProps = ref({
 *   dataOptions: {
 *     rows: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *       },
 *       DM.Commerce.Condition,
 *     ],
 *     columns: [DM.Commerce.AgeRange],
 *     values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     grandTotals: {
 *       rows: true,
 *       columns: true,
 *     },
 *   },
 *   styleOptions: {
 *     rowsPerPage: 15,
 *     height: 550,
 *     width: 900,
 *     totalsColor: true,
 *     headersColor: true,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <PivotTable
 *     :dataSet="DM.DataSource"
 *     :dataOptions="pivotTableProps.dataOptions"
 *     :styleOptions="pivotTableProps.styleOptions"
 *   />
 * </template>
 * ```
 *
 * <img src="media://pivot-table-example-5.png" width="800px" />
 *
 * Grand totals plus a subtotal row per `Year`, via {@link PivotTableDataOptions.rows}' `includeSubTotals`:
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { PivotTable } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const pivotTableProps = ref({
 *   dataOptions: {
 *     rows: [
 *       {
 *         column: DM.Commerce.Date.Years,
 *         dateFormat: 'yyyy',
 *         name: 'Year',
 *         includeSubTotals: true,
 *       },
 *       DM.Commerce.Condition,
 *     ],
 *     columns: [DM.Commerce.AgeRange],
 *     values: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     grandTotals: {
 *       rows: true,
 *       columns: true,
 *     },
 *   },
 *   styleOptions: {
 *     rowsPerPage: 15,
 *     height: 550,
 *     width: 900,
 *     totalsColor: true,
 *     headersColor: true,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <PivotTable
 *     :dataSet="DM.DataSource"
 *     :dataOptions="pivotTableProps.dataOptions"
 *     :styleOptions="pivotTableProps.styleOptions"
 *   />
 * </template>
 * ```
 *
 * <img src="media://pivot-table-example-6.png" width="800px" />
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
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<PivotTableProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!PivotTableProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<PivotTableProps['onDataPointContextMenu']>,
  },
  setup: (props) => setupHelper(PivotTablePreact, props),
});
