import type { Filter, FilterRelations } from '@sisense/sdk-data';
import {
  type ComposableDashboardProps as ComposableDashboardPropsPreact,
  createHookApiFacade,
  HookAdapter,
  useComposedDashboardInternal,
  type UseComposedDashboardOptions,
  type WidgetsPanelLayout,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, type Ref, watch } from 'vue';

import type { DashboardProps } from '../components/dashboard';
import { createSisenseContextConnector } from '../helpers/context-connectors';
import { useRefState } from '../helpers/use-ref-state';
import type { MaybeRef } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

export interface ComposableDashboardProps extends ComposableDashboardPropsPreact {}

/**
 * A Vue composable function `useComposedDashboard` that takes in separate dashboard elements and
 * composes them into a coordinated dashboard with cross filtering, and change detection.
 *
 * @example
 * How to use `useComposedDashboard` within a Vue component:
 * ```vue
<script setup lang="ts">
import { Widget, FilterTile, useComposedDashboard, type DashboardProps } from '@sisense/sdk-ui-vue';

const initialDashboardProps: DashboardProps = { ... };
const { dashboard } = useComposedDashboard(initialDashboardProps);
</script>
<template>
  <div>
    <FilterTile v-for="(filter, index) in dashboard.filters" :key="index" :filter="filter" />
    <Widget v-for="(widgetProps, index) in dashboard.widgets" :key="index" v-bind="widgetProps" />
  </div>
</template>
 * ```
 *
 * The composable returns an object with the following properties:
 * - `dashboard`: The composable dashboard object containing the current state of the dashboard.
 * - `setFilters`: API to set filters on the dashboard.
 * - `setWidgetsLayout`: API to set the layout of the widgets on the dashboard.
 *
 * @group Dashboards
 */
export const useComposedDashboard = <D extends ComposableDashboardProps | DashboardProps>(
  initialDashboard: MaybeRef<D>,
  options: UseComposedDashboardOptions = {},
): {
  dashboard: Ref<D>;
  setFilters: (filters: Filter[] | FilterRelations) => void;
  setWidgetsLayout: (newLayout: WidgetsPanelLayout) => void;
} => {
  useTracking('useComposedDashboard');

  const hookAdapter = new HookAdapter(useComposedDashboardInternal<D>, [
    createSisenseContextConnector(),
  ]);

  const [dashboard, setDashboard] = useRefState<D>(toPlainObject(initialDashboard));

  hookAdapter.subscribe(({ dashboard }) => {
    setDashboard(dashboard);
  });

  hookAdapter.run(toPlainObject(initialDashboard), options);

  watch([...collectRefs(initialDashboard)], () => {
    hookAdapter.run(toPlainObject(initialDashboard), options);
  });

  onBeforeUnmount(() => {
    hookAdapter.destroy();
  });

  const setFilters = createHookApiFacade(hookAdapter, 'setFilters');
  const setWidgetsLayout = createHookApiFacade(hookAdapter, 'setWidgetsLayout');

  return {
    dashboard,
    setFilters,
    setWidgetsLayout,
  };
};
