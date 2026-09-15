import { BoxplotChart as BoxplotChartPreact } from '@sisense/sdk-ui-preact';
import type { BoxplotChartProps as BoxplotChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!BoxplotChart | `BoxplotChart`} component.
 */
export interface BoxplotChartProps extends BoxplotChartPropsPreact {}

/**
 * A Vue component representing data in a way that visually describes the distribution, variability,
 * and center of a data set along an axis.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { BoxplotChart, type BoxplotChartDataOptions } from '@sisense/sdk-ui-vue';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [DM.Commerce.Condition],
 *     value: [{ column: DM.Commerce.Cost, name: 'Total Cost' }],
 *     boxType: 'iqr',
 *     outliersEnabled: true,
 *   } as BoxplotChartDataOptions,
 *   styleOptions: { subtype: 'boxplot/full' },
 * });
 * </script>
 *
 * <template>
 *   <BoxplotChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://boxplot-chart-example-1.png" width="700px" />
 * @param props - Boxplot chart properties
 * @returns Boxplot Chart component
 * @group Charts
 */
export const BoxplotChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<BoxplotChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<BoxplotChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<BoxplotChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<BoxplotChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<BoxplotChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<BoxplotChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<BoxplotChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<BoxplotChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<BoxplotChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<BoxplotChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(BoxplotChartPreact, props),
});
