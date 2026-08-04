import { SankeyChart as SankeyChartPreact } from '@sisense/sdk-ui-preact';
import type { SankeyChartProps as SankeyChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!SankeyChart | `SankeyChart`} component.
 */
export interface SankeyChartProps extends SankeyChartPropsPreact {}

/**
 * A Vue component that visualizes flow and volume between nodes using a Sankey diagram.
 *
 * Node width represents the total flow through that node; link width represents the flow
 * between two connected nodes.
 *
 * @example
 * Here's how you can use the SankeyChart component in a Vue application:
 * ```vue
 * <template>
 * <SankeyChart
 *      :dataOptions="sankeyChartProps.dataOptions"
 *      :dataSet="sankeyChartProps.dataSet"
 *      :styleOptions="sankeyChartProps.styleOptions"
 *    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-ecommerce';
 * import { SankeyChart, type SankeyChartProps } from '@sisense/sdk-ui-vue';
 *
 * const sankeyChartProps = ref<SankeyChartProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     category: [DM.Commerce.Gender, DM.Commerce.AgeRange],
 *     value: measureFactory.sum(DM.Commerce.Revenue, 'Revenue'),
 *   },
 *   styleOptions: {
 *     orientation: 'horizontal',
 *     nodeAlignment: 'top',
 *   },
 * });
 * </script>
 * ```
 * @param {SankeyChartProps} - Sankey chart properties
 * @returns Sankey Chart component
 * @group Charts
 */
export const SankeyChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<SankeyChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<SankeyChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<SankeyChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<SankeyChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<SankeyChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<SankeyChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<SankeyChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<SankeyChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<SankeyChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!SankeyChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<SankeyChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(SankeyChartPreact, props),
});
