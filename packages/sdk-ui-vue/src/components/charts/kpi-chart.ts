import { KpiChart as KpiChartPreact } from '@sisense/sdk-ui-preact';
import type { KpiChartProps as KpiChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!KpiChart | `KpiChart`} component.
 */
export interface KpiChartProps extends KpiChartPropsPreact {}

/**
 * A Vue component that displays a single headline metric as a card, optionally with a
 * sparkline of its trend and a readout comparing it against a baseline.
 *
 * Given just a measure, the card shows that number on its own. Adding a `category` — typically
 * a date dimension — gives it a sparkline and a caption for the period being shown. Adding a
 * `comparison` makes it also report how the metric moved: against the previous period, against
 * a second measure, or against a target.
 *
 * @example
 * Here's how you can use the KpiChart component in a Vue application:
 * ```vue
 * <template>
 * <KpiChart
      :dataSet="kpiChartProps.dataSet"
      :dataOptions="kpiChartProps.dataOptions"
      :filters="kpiChartProps.filters"
      :styleOptions="kpiChartProps.styleOptions"
    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-retail-model';
 * import { KpiChart, type KpiChartProps } from '@sisense/sdk-ui-vue';
 *
 * const kpiChartProps = ref<KpiChartProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     value: measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue'),
 *     category: DM.DimDate.Date.Months,
 *     comparison: { type: 'previous-period' },
 *   },
 *   styleOptions: {
 *     title: { text: 'Total Revenue' },
 *   },
 *   filters: [],
 * });
 * </script>
 * ```
 * @param {KpiChartProps} - KPI chart properties
 * @returns KPI Chart component
 * @group Charts
 */
export const KpiChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<KpiChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<KpiChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<KpiChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<KpiChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<KpiChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<KpiChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<KpiChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<KpiChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!KpiChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<KpiChartProps['onDataPointContextMenu']>,
  },
  setup: (props) => setupHelper(KpiChartPreact, props),
});
