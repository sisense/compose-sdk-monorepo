import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Dashboard as DashboardPreact } from '@sisense/sdk-ui-preact';
import type { DashboardProps } from '@sisense/sdk-ui-preact';
import { setupHelper } from '../../setup-helper';

/**
 * A Dashboard component used for easily rendering a dashboard.
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
 * @internal
 */
export const Dashboard = defineComponent({
  props: {
    title: String as PropType<DashboardProps['title']>,
    layout: Object as PropType<DashboardProps['layout']>,
    widgets: Object as PropType<DashboardProps['widgets']>,
    filters: Object as PropType<DashboardProps['filters']>,
    defaultDataSource: Object as PropType<DashboardProps['defaultDataSource']>,
    widgetFilterOptions: Object as PropType<DashboardProps['widgetFilterOptions']>,
  },
  setup: (props) => setupHelper(DashboardPreact, props),
});
