import { TreemapChart as TreemapChartPreact } from '@sisense/sdk-ui-preact';
import type { TreemapChartProps as TreemapChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!TreemapChart | `TreemapChart`} component.
 */
export interface TreemapChartProps extends TreemapChartPropsPreact {}

/**
 * A Vue component displaying hierarchical data in the form of nested rectangles.
 *
 * This type of chart can be used instead of a column chart for comparing a large number of categories and sub-categories.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { TreemapChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [{ column: DM.Commerce.Condition, isColored: true }, DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue)],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <TreemapChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 * <img src="media://treemap-chart-example-1.png" width="700px" />
 * @param props - Treemap chart properties
 * @returns Treemap Chart component
 * @group Charts
 */
export const TreemapChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<TreemapChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<TreemapChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<TreemapChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<TreemapChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<TreemapChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<TreemapChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<TreemapChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<TreemapChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<TreemapChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!TreemapChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<TreemapChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(TreemapChartPreact, props),
});
