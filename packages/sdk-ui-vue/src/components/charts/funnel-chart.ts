import { FunnelChart as FunnelChartPreact } from '@sisense/sdk-ui-preact';
import type { FunnelChartProps as FunnelChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!FunnelChart | `FunnelChart`} component.
 */
export interface FunnelChartProps extends FunnelChartPropsPreact {}

/**
 * A Vue component that wraps the FunnelChart Preact component for use in Vue applications.
 * It maintains compatibility with Vue's reactivity system while preserving the functionality of the FunnelChart.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { FunnelChart, FunnelStyleOptions } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *   },
 *   styleOptions: {
 *     funnelType: 'regular',
 *     funnelSize: 'regular',
 *     funnelDirection: 'regular',
 *   } as FunnelStyleOptions,
 * });
 * </script>
 *
 * <template>
 *   <FunnelChart
 *     :dataSet="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *     :styleOptions="chartProps.styleOptions"
 *   />
 * </template>
 * ```
 * <img src="media://funnel-chart-example-1.png" width="700px" />
 * @param props - Funnel chart properties
 * @returns Funnel Chart component
 * @group Charts
 */
export const FunnelChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<FunnelChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<FunnelChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<FunnelChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<FunnelChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<FunnelChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<FunnelChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<FunnelChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<FunnelChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<FunnelChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!FunnelChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<FunnelChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(FunnelChartPreact, props),
});
