import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Widget as WidgetPreact } from '@ethings-os/sdk-ui-preact';
import type {
  ChartWidgetProps,
  PivotTableWidgetProps as PivotTableWidgetPropsPreact,
  CustomWidgetProps,
  SoftUnion,
  TextWidgetProps,
  WidgetProps as WidgetPropsPreact,
  WithCommonWidgetProps,
} from '@ethings-os/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';

export { WithCommonWidgetProps, TextWidgetProps, CustomWidgetProps };

export interface PivotTableWidgetProps extends PivotTableWidgetPropsPreact {}

/**
 * Props of the {@link @ethings-os/sdk-ui-vue!Widget | `Widget`} component.
 */
export type WidgetProps = SoftUnion<
  | WithCommonWidgetProps<ChartWidgetProps, 'chart'>
  | WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'>
  | WithCommonWidgetProps<TextWidgetProps, 'text'>
  | WithCommonWidgetProps<CustomWidgetProps, 'custom'>
>;

/**
 * Facade component that renders a widget within a dashboard based on the widget type.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { Widget, type WidgetProps } from '@ethings-os/sdk-ui-vue';
 * import { measureFactory } from '@ethings-os/sdk-data';
 *
 * const widgetProps: WidgetProps = {
 *   id: 'widget-id',
 *   widgetType: 'chart',
 *   dataSource: DM.DataSource,
 *   chartType: 'column',
 *   dataOptions: {
 *     category: [dimProductName],
 *     value: [
 *       {
 *         column: measureFactory.sum(DM.Fact_Sale_orders.OrderRevenue, 'Total Revenue'),
 *         sortType: 'sortDesc',
 *       },
 *     ],
 *     breakBy: [],
 *   },
 * };
 * </script>
 *
 * <template>
 *   <Widget
 *     :id="widgetProps.id"
 *     :widgetType="widgetProps.widgetType"
 *     :dataSource="widgetProps.dataSource"
 *     :chartType="widgetProps.chartType"
 *     :dataOptions="widgetProps.dataOptions"
 *   />
 * </template>
 * ```
 * <img src="media://vue-widget-example.png" width="800px" />
 * @group Dashboards
 */
export const Widget = defineComponent({
  props: {
    /**
     * Unique identifier of the widget
     *
     * @category Widget
     */
    id: {
      type: String as PropType<WidgetProps['id']>,
      required: true,
    },
    /**
     * Widget type
     *
     * @category Widget
     */
    widgetType: {
      type: String as PropType<WidgetProps['widgetType']>,
      required: true,
    },
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.chartType}
     *
     * @category Chart
     */
    chartType: String as PropType<WidgetProps['chartType']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!CustomWidgetProps.customWidgetType}
     *
     * @category Widget
     */
    customWidgetType: String as PropType<WidgetProps['customWidgetType']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.dataSource}
     *
     * @category Data
     */
    dataSource: Object as PropType<WidgetProps['dataSource']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.dataOptions}
     *
     * @category Chart
     */
    dataOptions: Object as PropType<WidgetProps['dataOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.filters}
     *
     * @category Data
     */
    filters: Array as PropType<WidgetProps['filters']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.highlights}
     *
     * @category Data
     */
    highlights: Array as PropType<WidgetProps['highlights']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.styleOptions}
     *
     * @category Widget
     */
    styleOptions: Object as PropType<WidgetProps['styleOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.drilldownOptions}
     *
     * @category Widget
     */
    drilldownOptions: Object as PropType<WidgetProps['drilldownOptions']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.title}
     *
     * @category Widget
     */
    title: String as PropType<WidgetProps['title']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.description}
     *
     * @category Widget
     */
    description: String as PropType<WidgetProps['description']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.highlightSelectionDisabled}
     *
     * @category Widget
     * @internal
     */
    highlightSelectionDisabled: Boolean as PropType<WidgetProps['highlightSelectionDisabled']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onBeforeRender}
     *
     * @category Callbacks
     */
    onBeforeRender: Function as PropType<WidgetProps['onBeforeRender']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onDataReady}
     *
     * @category Callbacks
     */
    onDataReady: Function as PropType<WidgetProps['onDataReady']>,
    /**
     * Optional handler function to process menu options before opening the context menu.
     *
     * @category Callbacks
     * @internal
     */
    onBeforeMenuOpen: Function as PropType<WidgetProps['onBeforeMenuOpen']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onDataPointClick}
     *
     * @category Callbacks
     */
    onDataPointClick: Function as PropType<WidgetProps['onDataPointClick']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onDataPointContextMenu}
     *
     * @category Callbacks
     */
    onDataPointContextMenu: Function as PropType<WidgetProps['onDataPointContextMenu']>,
    /**
     * {@inheritDoc @ethings-os/sdk-ui!ChartWidgetProps.onDataPointsSelected}
     *
     * @category Callbacks
     */
    onDataPointsSelected: Function as PropType<WidgetProps['onDataPointsSelected']>,
  },
  setup: (props) => setupHelper(WidgetPreact, props as WidgetPropsPreact),
});
