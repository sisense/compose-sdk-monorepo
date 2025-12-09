import { StreamgraphChart as StreamgraphChartPreact } from '@sisense/sdk-ui-preact';
import type { StreamgraphChartProps as StreamgraphChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!StreamgraphChart | `StreamgraphChart`} component.
 */
export interface StreamgraphChartProps extends StreamgraphChartPropsPreact {}

/**
 * A Vue component that displays a streamgraph chart.
 *
 * A streamgraph is a type of stacked area chart where areas are displaced around
 * a central axis. It is particularly effective for displaying volume across
 * different categories or over time with a relative scale that emphasizes
 * overall patterns and trends.
 *
 * @example
 * Here's how you can use the StreamgraphChart component in a Vue application:
 * ```vue
 * <template>
 * <StreamgraphChart
 *      :dataOptions="streamgraphChartProps.dataOptions"
 *      :dataSet="streamgraphChartProps.dataSet"
 *      :filters="streamgraphChartProps.filters"
 *      :styleOptions="streamgraphChartProps.styleOptions"
 *    />
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { measureFactory, filterFactory } from '@sisense/sdk-data';
 * import * as DM from '../assets/sample-ecommerce';
 * import { StreamgraphChart, type StreamgraphChartProps } from '@sisense/sdk-ui-vue';
 *
 * const streamgraphChartProps = ref<StreamgraphChartProps>({
 *   dataSet: DM.DataSource,
 *   dataOptions: {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Revenue')],
 *     breakBy: [DM.Category.Category],
 *   },
 *   filters: [filterFactory.members(DM.Category.Category, ['Electronics', 'Clothing'])],
 *   styleOptions: {
 *     width: 1200,
 *     height: 500,
 *   },
 * });
 * ```
 * @param {StreamgraphChartProps} - Streamgraph chart properties
 * @returns Streamgraph Chart component
 * @group Charts
 */
export const StreamgraphChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<StreamgraphChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<StreamgraphChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<StreamgraphChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<StreamgraphChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<StreamgraphChartProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<StreamgraphChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<StreamgraphChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<StreamgraphChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<StreamgraphChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!StreamgraphChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<StreamgraphChartProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(StreamgraphChartPreact, props),
});
