import { AreamapChart as AreamapChartPreact } from '@sisense/sdk-ui-preact';
import type { AreamapChartProps as AreamapChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!AreamapChart | `AreamapChart`} component.
 */
export interface AreamapChartProps extends AreamapChartPropsPreact {}

/**
 * A Vue component for visualizing geographical data as polygons on a map.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { AreamapChart, type AreamapChartDataOptions, type AreamapStyleOptions } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref<{
 *   dataOptions: AreamapChartDataOptions;
 *   styleOptions: AreamapStyleOptions;
 * }>({
 *   dataOptions: {
 *     geo: [DM.Country.Country],
 *     color: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   },
 *   styleOptions: { mapType: 'world' },
 * });
 * </script>
 *
 * <template>
 *   <AreamapChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://areamap-chart-example-1.png" width="700px" />
 * @param props - Areamap chart properties
 * @returns Areamap Chart component
 * @group Charts
 */
export const AreamapChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<AreamapChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<AreamapChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<AreamapChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<AreamapChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<AreamapChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<AreamapChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.onDataPointClick}
     *
     * @category Callbacks
     */

    onDataPointClick: Function as PropType<AreamapChartProps['onDataPointClick']>,
  },
  setup: (props) => setupHelper(AreamapChartPreact, props),
});
