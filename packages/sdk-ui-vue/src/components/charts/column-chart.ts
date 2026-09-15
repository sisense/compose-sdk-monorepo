import { ColumnChart as ColumnChartPreact } from '@sisense/sdk-ui-preact';
import type { ColumnChartProps as ColumnChartPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';

/**
 * Props of the {@link @sisense/sdk-ui-vue!ColumnChart | `ColumnChart`} component.
 */
export interface ColumnChartProps extends ColumnChartPropsPreact {}

/**
 * A Vue component representing categorical data with vertical rectangular bars
 * whose heights are proportional to the values that they represent.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { ColumnChart } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref({
 *   dataOptions: {
 *     category: [DM.Commerce.Date.Years],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [DM.Commerce.Condition],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <ColumnChart :dataSet="DM.DataSource" :dataOptions="chartProps.dataOptions" />
 * </template>
 * ```
 * <img src="media://column-chart-example-1.png" width="700px" />
 * @param props - Column chart properties
 * @returns Column Chart component
 * @group Charts
 */
export const ColumnChart = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ColumnChartProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.dataSet}
     *
     * @category Data
     */
    dataSet: [String, Object] as PropType<ColumnChartProps['dataSet']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.filters}
     *
     * @category Data
     */
    filters: [Object, Array] as PropType<ColumnChartProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ColumnChartProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ColumnChartProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ColumnChartProps['onDataReady']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ColumnChartProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ColumnChartProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ColumnChartProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ColumnChartProps.styleOptions}
     *
     * @category Chart
     */
    styleOptions: Object as PropType<ColumnChartProps['styleOptions']>,
  },
  setup: (props) => setupHelper(ColumnChartPreact, props),
});
