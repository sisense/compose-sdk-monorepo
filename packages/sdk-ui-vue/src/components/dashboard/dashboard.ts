import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Dashboard as DashboardPreact } from '@sisense/sdk-ui-preact';
import type { DashboardProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

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
 *    :defaultDataSource="dashboardProps.dataSource"
 *    :widgetsOptions="dashboardProps.widgetsOptions"
 *    :styleOptions="dashboardProps.styleOptions"
 *  />
 * </template>
 *
 * <script setup lang="ts">
 * import { dashboardModelTranslator, useGetDashboardModel } from '@sisense/sdk-ui-vue';
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
 * @group Dashboarding
 * @beta
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
     *
     * @internal
     */
    config: Object as PropType<DashboardProps['config']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgets}
     */
    widgets: Object as PropType<DashboardProps['widgets']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.filters}
     */
    filters: Object as PropType<DashboardProps['filters']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.defaultDataSource}
     */
    defaultDataSource: Object as PropType<DashboardProps['defaultDataSource']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgetsOptions}
     */
    widgetsOptions: Object as PropType<DashboardProps['widgetsOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.styleOptions}
     */
    styleOptions: Object as PropType<DashboardProps['styleOptions']>,
  },
  setup: (props) => setupHelper(DashboardPreact, props),
});
