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
 *    v-if="dashboard"
 *    :title="dashboard.title"
 *    :layout="dashboard.layout"
 *    :widgets="dashboard.widgets"
 *    :filters="dashboard.filters"
 *    :defaultDataSource="dashboard.dataSource"
 *    :widgetFilterOptions="dashboard.widgetFilterOptions"
 *    :styleOptions="dashboard.styleOptions"
 *  />
 * </template>
 *
 * <script setup lang="ts">
 * import { DashboardById, useGetDashboardModel } from '@sisense/sdk-ui-vue';
 *
 * const { dashboard } = useGetDashboardModel({
 *  dashboardOid: '6441e728dac1920034bce737',
 *  includeWidgets: true,
 *  includeFilters: true,
 * });
 * </script>
 * ```
 * @group Fusion Embed
 * @fusionEmbed
 * @alpha
 */
export const Dashboard = defineComponent({
  props: {
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.title}
     */
    title: String as PropType<DashboardProps['title']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.layout}
     */
    layout: Object as PropType<DashboardProps['layout']>,
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
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgetFilterOptions}
     */
    widgetFilterOptions: Object as PropType<DashboardProps['widgetFilterOptions']>,
    /**
     * {@inheritDoc @sisense/sdk-ui!DashboardProps.styleOptions}
     */
    styleOptions: Object as PropType<DashboardProps['styleOptions']>,
  },
  setup: (props) => setupHelper(DashboardPreact, props),
});
