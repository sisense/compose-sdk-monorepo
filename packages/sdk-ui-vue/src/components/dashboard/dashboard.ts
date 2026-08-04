import {
  // a runtime constant of built-in item ids — must not be a type-only import
  DashboardHeaderTargets,
  Dashboard as DashboardPreact,
} from '@sisense/sdk-ui-preact';
import type {
  DashboardConfig as DashboardConfigPreact,
  DashboardFiltersPanelConfig,
  DashboardHeaderItemComponentProps,
  DashboardHeaderItemPosition,
  DashboardHeaderItemSize,
  DashboardHeaderTarget,
  DashboardProps as DashboardPropsPreact,
} from '@sisense/sdk-ui-preact';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { createComponentTranslator } from '../../helpers/component-translator';
import { toPreactDashboardProps } from '../../helpers/dashboard-props-preact-translator';
import { setupHelper, toDeepRaw } from '../../helpers/setup-helper';
import { getCustomWidgetsContext } from '../../providers/custom-widgets-provider';
import { getSisenseContext } from '../../providers/sisense-context-provider/sisense-context';
import { getThemeContext } from '../../providers/theme-provider/theme-context';
import type { WidgetProps } from '../widgets';
import { type DashboardHeaderConfig } from './dashboard-header-config';

export { DashboardHeaderTargets };
export type {
  DashboardFiltersPanelConfig,
  DashboardHeaderItemComponentProps,
  DashboardHeaderItemPosition,
  DashboardHeaderItemSize,
  DashboardHeaderTarget,
};
export type {
  DashboardHeaderConfig,
  DashboardHeaderItem,
  DashboardHeaderItemComponent,
  DashboardHeaderItemsTransform,
  DashboardResolvedHeaderItem,
} from './dashboard-header-config';

/**
 * Configuration for the {@link @sisense/sdk-ui-vue!Dashboard | `Dashboard`} component.
 */
export interface DashboardConfig extends Omit<DashboardConfigPreact, 'header'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardConfig.header}
   */
  header?: DashboardHeaderConfig;
}

/**
 * Props of the {@link @sisense/sdk-ui-vue!Dashboard | `Dashboard`} component.
 */
export interface DashboardProps extends Omit<DashboardPropsPreact, 'widgets' | 'config'> {
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.widgets}
   */
  widgets: WidgetProps[];
  /**
   * {@inheritDoc @sisense/sdk-ui!DashboardProps.config}
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
 *    :config="dashboardProps.config"
 *    :defaultDataSource="dashboardProps.defaultDataSource"
 *    :filters="dashboardProps.filters"
 *    :layoutOptions="dashboardProps.layoutOptions"
 *    :styleOptions="dashboardProps.styleOptions"
 *    :title="dashboardProps.title"
 *    :widgets="dashboardProps.widgets"
 *    :widgetsOptions="dashboardProps.widgetsOptions"
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
  },
  setup: (props) => {
    const componentTranslator = createComponentTranslator({
      sisenseContext: getSisenseContext(),
      themeContext: getThemeContext(),
      customWidgetsContext: getCustomWidgetsContext(),
    });
    // a props getter, so the conversion re-runs on every render and prop updates keep flowing
    return setupHelper(DashboardPreact, () =>
      toPreactDashboardProps(toDeepRaw(props), componentTranslator),
    );
  },
});
