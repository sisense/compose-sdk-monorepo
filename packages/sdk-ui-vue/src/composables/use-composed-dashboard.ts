import type { Filter, FilterRelations } from '@sisense/sdk-data';
import {
  type ComposableDashboardProps as ComposableDashboardPropsPreact,
  createHookApiFacade,
  type DashboardProps as DashboardPropsPreact,
  HookAdapter,
  useComposedDashboardInternal,
  type UseComposedDashboardOptions,
  type WidgetsPanelLayout,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, type Ref, watch } from 'vue';

import type { DashboardConfig, DashboardProps } from '../components/dashboard';
import { createSisenseContextConnector } from '../helpers/context-connectors';
import { useRefState } from '../helpers/use-ref-state';
import type { MaybeRef } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

export interface ComposableDashboardProps extends Omit<ComposableDashboardPropsPreact, 'config'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.config}
   */
  config?: DashboardConfig;
}

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

  // The composition hook runs on the preact flavor of the props; the Vue and preact flavors
  // differ only in the custom header item components carried inside `config.header`, which the
  // composition never renders or touches, so the props are structurally reused and only re-typed.
  const toPreactProps = (props: MaybeRef<D>) =>
    toPlainObject(props) as unknown as ComposableDashboardPropsPreact | DashboardPropsPreact;

  const hookAdapter = new HookAdapter(
    useComposedDashboardInternal<ComposableDashboardPropsPreact | DashboardPropsPreact>,
    [createSisenseContextConnector()],
  );

  const [dashboard, setDashboard] = useRefState<D>(toPlainObject(initialDashboard));

  hookAdapter.subscribe(({ dashboard }) => {
    setDashboard(dashboard as unknown as D);
  });

  hookAdapter.run(toPreactProps(initialDashboard), options);

  watch([...collectRefs(initialDashboard)], () => {
    hookAdapter.run(toPreactProps(initialDashboard), options);
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
