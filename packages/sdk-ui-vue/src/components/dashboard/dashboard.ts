import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Dashboard as DashboardPreact } from '@sisense/sdk-ui-preact';
import type { DashboardProps as DashboardPropsPreact } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../helpers/setup-helper';
import type { DashboardConfig } from '../../types';
import type { WidgetProps } from '../widgets';

/**
 * Props of the {@link @sisense/sdk-ui-vue!Dashboard | `Dashboard`} component.
 */
export interface DashboardProps extends Omit<DashboardPropsPreact, 'widgets'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgets}
   */
  widgets: WidgetProps[];
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardByIdProps.config}
   */
  config?: DashboardConfig;
}

/**
 * A component used for easily rendering a dashboard.
 *
 * @example
 * Here's how you can use the Dashboard component in a Vue application:
 * ```vue
 * <template>
 *  <Dashboard
 *    v-if="dashboardProps"
 *    :title="dashboardProps.title"
 *    :layoutOptions="dashboardProps.layoutOptions"
 *    :widgets="dashboardProps.widgets"
 *    :filters="dashboardProps.filters"
 *    :defaultDataSource="dashboardProps.defaultDataSource"
 *    :widgetsOptions="dashboardProps.widgetsOptions"
 *    :styleOptions="dashboardProps.styleOptions"
 *  />
 * </template>
 *
 * <script setup lang="ts">
 * import { dashboardModelTranslator, useGetDashboardModel, Dashboard } from '@sisense/sdk-ui-vue';
 * import { computed } from 'vue';
 *
 * const { dashboard } = useGetDashboardModel({
 *  dashboardOid: '6441e728dac1920034bce737',
 *  includeWidgets: true,
 *  includeFilters: true,
 * });
 *
 * const dashboardProps = computed(() =>
 *   dashboard.value ? dashboardModelTranslator.toDashboardProps(dashboard.value) : null,
 * );
 * </script>
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Dashboards
 */
export const Dashboard = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.title}
     */
    title: String as PropType<DashboardProps['title']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.layoutOptions}
     */
    layoutOptions: Object as PropType<DashboardProps['layoutOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.config}
     */
    config: Object as PropType<DashboardProps['config']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgets}
     */
    widgets: {
      type: Object as PropType<DashboardProps['widgets']>,
      required: true,
    },
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.filters}
     */
    filters: [Object, Array] as PropType<DashboardProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.defaultDataSource}
     */
    defaultDataSource: [String, Object] as PropType<DashboardProps['defaultDataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgetsOptions}
     */
    widgetsOptions: Object as PropType<DashboardProps['widgetsOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.styleOptions}
     */
    styleOptions: Object as PropType<DashboardProps['styleOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.tabbersOptions}
     *
     * @internal
     */
    tabbersOptions: Object as PropType<DashboardProps['tabbersOptions']>,
  },
  setup: (props) => setupHelper(DashboardPreact, props),
});
