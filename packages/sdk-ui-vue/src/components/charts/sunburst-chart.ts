import { SunburstChart as SunburstChartPreact } from '@sisense/sdk-ui-preact';
import type { SunburstChartProps as SunburstChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!SunburstChart | `SunburstChart`} component.
 */
export interface SunburstChartProps extends SunburstChartPropsPreact {}

/**
 * A Vue component that wraps the SunburstChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the SunburstChart.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { SunburstChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [DM.Commerce.Condition, DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Quantity, 'Total Quantity')],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <SunburstChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 * <img src="media://sunburst-chart-example-1.png" width="700px" />
 * @param props - Sunburst Chart properties
 * @returns Sunburst Chart component
 * @group Charts
 */
export const SunburstChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<SunburstChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<SunburstChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<SunburstChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<SunburstChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<SunburstChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<SunburstChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<SunburstChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<SunburstChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<SunburstChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SunburstChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<SunburstChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(SunburstChartPreact, props),
});
