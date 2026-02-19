import {
  HookAdapter,
  type JumpToDashboardConfig,
  type JumpToDashboardConfigForPivot,
  useJtdWidget as useJtdWidgetPreact,
  type WidgetProps,
} from '@sisense/sdk-ui-preact';
import { onBeforeUnmount, ref, type Ref, toValue, watch } from 'vue';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../helpers/context-connectors';
import type { MaybeRef, MaybeRefOrWithRefs } from '../types';
import { collectRefs, toPlainObject } from '../utils';
import { useTracking } from './use-tracking';

/**
 * Composable to add Jump To Dashboard (JTD) functionality to individual Widget components.
 *
 * Jump To Dashboard (JTD) allows users to navigate from one dashboard to another when interacting with widgets,
 * such as clicking on chart data points or using context menus. This composable is particularly useful when rendering
 * Widget components directly (not through a Dashboard component), but you still want JTD navigation functionality.
 *
 * For widgets that are part of a dashboard, consider using `applyJtdConfig` or `applyJtdConfigs` instead,
 * as they apply JTD configuration at the dashboard level rather than individual widget level.
 *
 * Note: dashboard-only 'includeDashboardFilters' is not supported and would just be ignored, since we do not have a dashboard in the current context.
 *
 * @example
 * Basic JTD configuration with right-click navigation.
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { Widget, useJtdWidget } from '@sisense/sdk-ui-vue';
 *
 * const myWidgetProps = ref({
 *   id: 'widget-1',
 *   widgetType: 'chart',
 *   dataSource: 'Sample ECommerce',
 *   // ... other widget props
 * });
 *
 * const jtdConfig = {
 *   targets: [{ id: 'dashboard-1', caption: 'Sales Dashboard' }],
 *   interaction: {
 *     triggerMethod: 'rightclick',
 *     captionPrefix: 'Jump to'
 *   }
 * };
 *
 * const widgetWithJtd = useJtdWidget(myWidgetProps, jtdConfig);
 * </script>
 *
 * <template>
 *   <Widget v-bind="widgetWithJtd" />
 * </template>
 * ```
 *
 * @example
 * JTD configuration with multiple targets and custom styling.
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { Widget, useJtdWidget } from '@sisense/sdk-ui-vue';
 *
 * const chartProps = ref({ ... });
 *
 * const jtdConfig = {
 *   enabled: true,
 *   targets: [
 *     { id: 'sales-dashboard', caption: 'Sales Analysis' },
 *     { id: 'marketing-dashboard', caption: 'Marketing Insights' }
 *   ],
 *   interaction: {
 *     triggerMethod: 'click',
 *     captionPrefix: 'Navigate to',
 *     showIcon: true
 *   },
 *   filtering: {
 *     mergeWithTargetFilters: true,
 *     includeWidgetFilters: true
 *   }
 * };
 *
 * const widgetWithJtd = useJtdWidget(chartProps, jtdConfig);
 * </script>
 *
 * <template>
 *   <Widget v-bind="widgetWithJtd" />
 * </template>
 * ```
 *
 * @param widgetProps - Widget properties to enhance with JTD functionality (can be a ref or plain object)
 * @param config - Jump To Dashboard configuration
 * @returns Computed ref containing enhanced widget props with JTD navigation capabilities
 * @group Dashboards
 */
export const useJtdWidget = (
  widgetProps: MaybeRef<WidgetProps | null>,
  config: MaybeRefOrWithRefs<JumpToDashboardConfig | JumpToDashboardConfigForPivot>,
): Ref<WidgetProps | null> => {
  useTracking('useJtdWidget');

  const hookAdapter = new HookAdapter(useJtdWidgetPreact, [
    createSisenseContextConnector(),
    createThemeContextConnector(),
  ]);

  const enhancedWidgetProps = ref<WidgetProps | null>(null);

  hookAdapter.subscribe((result) => {
    enhancedWidgetProps.value = result;
  });

  const runHook = () => {
    const props = toValue(widgetProps);
    const plainConfig = toPlainObject(config);
    hookAdapter.run(props, plainConfig);
  };

  // Initial run
  runHook();

  // Watch for changes
  watch([...collectRefs(widgetProps), ...collectRefs(config)], () => {
    runHook();
  });

  onBeforeUnmount(() => {
    hookAdapter.destroy();
  });

  return enhancedWidgetProps;
};
