import {
  type DashboardModel,
  dashboardModelTranslator as dashboardModelTranslatorPreact,
} from '@sisense/sdk-ui-preact';

import type { DashboardProps } from '../components/dashboard';

/**
 * Translates {@link DashboardModel} to {@link DashboardProps}.
 *
 * @example
 * ```vue
<script setup lang="ts">
import { dashboardModelTranslator, useGetDashboardModel, Dashboard } from '@sisense/sdk-ui-vue';
import { computed } from 'vue';

const { dashboard } = useGetDashboardModel({
  dashboardOid: 'your-dashboard-oid',
  includeWidgets: true,
  includeFilters: true,
});

const dashboardProps = computed(() =>
  dashboard.value ? dashboardModelTranslator.toDashboardProps(dashboard.value) : null,
);
</script>

<template>
  <Dashboard
    v-if="dashboardProps"
    :title="dashboardProps.title"
    :layoutOptions="dashboardProps.layoutOptions"
    :widgets="dashboardProps.widgets"
    :filters="dashboardProps.filters"
    :defaultDataSource="dashboardProps.defaultDataSource"
    :widgetsOptions="dashboardProps.widgetsOptions"
    :styleOptions="dashboardProps.styleOptions"
  />
</template>
 * ```
 */
export function toDashboardProps(dashboardModel: DashboardModel): DashboardProps {
  return dashboardModelTranslatorPreact.toDashboardProps(dashboardModel);
}
