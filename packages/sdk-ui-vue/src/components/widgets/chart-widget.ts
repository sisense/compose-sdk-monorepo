import { ChartWidget as ChartWidgetPreact } from '@sisense/sdk-ui-preact';
import type { ChartWidgetProps as ChartWidgetPropsPreact } from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { setupHelper } from '../../helpers/setup-helper';
import type { Chart } from '../charts';
import type { ChartWidgetConfig } from './widget-config';

/**
 * Props of the {@link @sisense/sdk-ui-vue!ChartWidget | `ChartWidget`} component.
 */
export interface ChartWidgetProps extends Omit<ChartWidgetPropsPreact, 'config'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.config}
   *
   * @category Widget
   */
  config?: ChartWidgetConfig;
}

/**
 * The Chart Widget component extending the {@link Chart} component to support widget style options.
 * It can be used along with the {@link DrilldownWidget} component to support advanced data drilldown.
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { ref } from 'vue';
 * import { type ChartDataOptions, type ChartType, ChartWidget } from '@sisense/sdk-ui-vue';
 * import { measureFactory } from '@sisense/sdk-data';
 * import * as DM from './sample-ecommerce';
 *
 * const chartProps = ref<{
 *   chartType: ChartType;
 *   title: string;
 *   description: string;
 *   dataOptions: ChartDataOptions;
 * }>({
 *   chartType: 'column',
 *   title: 'Revenue by Quarter',
 *   description: 'This chart shows the total revenue by quarter.',
 *   dataOptions: {
 *     category: [DM.Commerce.Date.Quarters],
 *     value: [measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')],
 *     breakBy: [],
 *   },
 * });
 * </script>
 *
 * <template>
 *   <ChartWidget
 *     :chartType="chartProps.chartType"
 *     :title="chartProps.title"
 *     :description="chartProps.description"
 *     :dataSource="DM.DataSource"
 *     :dataOptions="chartProps.dataOptions"
 *   />
 * </template>
 * ```
 * <img src="media://chart-widget-example-1.png" width="700px" />
 * @param props - ChartWidget properties
 * @returns ChartWidget component representing a chart type as specified in `ChartWidgetProps.`{@link ChartWidgetProps.chartType | chartType}
 * @group Dashboards
 */
export const ChartWidget = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.bottomSlot}
     *
     * @category Widget
     * @internal
     */
    bottomSlot: Object as PropType<ChartWidgetProps['bottomSlot']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.chartType}
     *
     * @category Chart
     */
    chartType: {
      type: String as PropType<ChartWidgetProps['chartType']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: {
      type: Object as PropType<ChartWidgetProps['dataOptions']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.dataSource}
     *
     * @category Data
     */
    dataSource: [String, Object] as PropType<ChartWidgetProps['dataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.description}
     *
     * @category Widget
     */
    description: String as PropType<ChartWidgetProps['description']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.drilldownOptions}
     *
     * @category Widget
     * @internal
     */
    drilldownOptions: Object as PropType<ChartWidgetProps['drilldownOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.filters}
     *
     * @category Data
     */
    filters: [Array, Object] as PropType<ChartWidgetProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlightSelectionDisabled}
     *
     * @category Widget
     */
    highlightSelectionDisabled: Boolean as PropType<ChartWidgetProps['highlightSelectionDisabled']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<ChartWidgetProps['highlights']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<ChartWidgetProps['onBeforeRender']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<ChartWidgetProps['onDataPointClick']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<ChartWidgetProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<ChartWidgetProps['onDataPointsSelected']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.styleOptions}
     *
     * @category Widget
     */
    styleOptions: Object as PropType<ChartWidgetProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.config}
     *
     * @category Widget
     */
    config: Object as PropType<ChartWidgetProps['config']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.id}
     *
     * @category Widget
     */
    id: String as PropType<ChartWidgetProps['id']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.title}
     *
     * @category Widget
     */
    title: String as PropType<ChartWidgetProps['title']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.topSlot}
     *
     * @category Widget
     * @internal
     */
    topSlot: Object as PropType<ChartWidgetProps['topSlot']>,
    // TODO Remove this prop as part of https://developer.sisense.com/guides/sdk/guides/migration-guide-1.0.0.html#removed
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.styleOptions}
     * @category Widget
     * @internal
     */
    widgetStyleOptions: Object as PropType<ChartWidgetProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!ChartWidgetProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<ChartWidgetProps['onDataReady']>,
  },
  setup: (props) => setupHelper(ChartWidgetPreact, props),
});
