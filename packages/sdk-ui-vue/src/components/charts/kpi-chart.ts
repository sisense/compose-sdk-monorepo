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
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { KpiChart } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 * import { measureFactory } from '@sisense/sdk-data';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     value: measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue'),
 *     category: DM.Commerce.Date.Months,
 *     comparison: { type: 'previous-period' },
 *   },
 *   styleOptions: {
 *     sparkline: { chartType: 'area' },
 *     height: 250,
 *   },
 * });
 * </script>
 *
 * <template>
 *   <KpiChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://kpi-chart-example-1.png" width="400px" />
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
