import { useCallback, useMemo } from 'react';
import { useCommonFilters } from '@/common-filters/use-common-filters';
import { WidgetProps } from '@/props';
import { defaultMerger, useWithChangeDetection } from '@/common/hooks/use-with-change-detection';
import cloneDeep from 'lodash-es/cloneDeep';
import { withTracking } from '@/decorators/hook-decorators';
import { useCombinedMenu } from '@/common/hooks/use-combined-menu';
import { MenuOptions } from '@/common/components/menu/types';
import { MenuIds } from '@/common/components/menu/menu-ids';
import { DashboardProps } from './types.js';
import { Filter, FilterRelations } from '@sisense/sdk-data';
import { useSyncedState } from '@/common/hooks/use-synced-state.js';
import { useWidgetsLayoutManagement } from '@/dashboard/hooks/use-widgets-layout';
import { getDefaultWidgetsPanelLayout } from '@/dashboard/utils';
import { useTabber } from '@/dashboard/hooks/use-tabber';
import { WidgetsPanelLayout } from '@/models';

export type ComposableDashboardProps = Pick<
  DashboardProps,
  'filters' | 'widgets' | 'widgetsOptions' | 'layoutOptions' | 'tabbersOptions'
>;

function combineCommonFiltersAndWidgetMenus(
  commonFiltersMenuOptions: MenuOptions,
  drilldownMenuOptions: MenuOptions,
): MenuOptions {
  const drilldownMenuItemsWithoutSelectionSection = drilldownMenuOptions.itemSections.filter(
    ({ id }) => id !== MenuIds.DRILLDOWN_CHART_POINTS_SELECTION,
  );
  return {
    ...commonFiltersMenuOptions,
    itemSections: [
      ...commonFiltersMenuOptions.itemSections,
      ...drilldownMenuItemsWithoutSelectionSection,
    ],
  };
}

function isDrilldownMenu(options: MenuOptions): boolean {
  return options.itemSections.some(({ id }) => id === MenuIds.DRILLDOWN_CHART_POINTS_SELECTION);
}

export type UseComposedDashboardOptions = {
  /**
   * @internal
   */
  onFiltersChange?: (filters: Filter[] | FilterRelations) => void;
};

/**
 * {@link useComposedDashboard} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @param params - Parameters of the composable dashboard props
 * @internal
 */
export function useComposedDashboardInternal<D extends ComposableDashboardProps | DashboardProps>(
  initialDashboard: D,
  { onFiltersChange }: UseComposedDashboardOptions = {},
): {
  dashboard: D;
  // APIs:
  setFilters: (filters: Filter[] | FilterRelations) => void;
  setWidgetsLayout: (newLayout: WidgetsPanelLayout) => void;
} {
  const { filters, widgets, widgetsOptions } = initialDashboard;
  // This state is needed to avoid losing the inner state when new widget objects are received from toDashboardProps.
  // Known issue: if the user forces an update with identical widgets as those already present in widgetsFromProps, it will be ignored.
  const [widgetsFromProps] = useSyncedState<WidgetProps[]>(widgets);
  // Internal widget state
  const [innerWidgets, setInnerWidgets] = useSyncedState<WidgetProps[]>(widgetsFromProps);
  // Combined menu logic
  const { openMenu, onBeforeMenuOpen } = useCombinedMenu({
    isTargetMenu: isDrilldownMenu,
    combineMenus: combineCommonFiltersAndWidgetMenus,
  });
  // Common filters logic (with filters state inside)
  const {
    filters: commonFilters,
    setFilters,
    connectToWidgetProps,
  } = useCommonFilters({ initialFilters: filters, openMenu, onBeforeMenuOpen, onFiltersChange });
  // Change detection logic
  const widgetsWithChangeDetection = useWithChangeDetection({
    target: innerWidgets,
    onChange: useCallback(
      (delta: Partial<WidgetProps>, index?: number) => {
        setInnerWidgets((existingInnerWidgets) => {
          const newInnerWidgets = cloneDeep(existingInnerWidgets);
          newInnerWidgets[index!] = defaultMerger(existingInnerWidgets[index!], delta);
          return newInnerWidgets;
        });
      },
      [setInnerWidgets],
    ),
  }) as WidgetProps[];
  // Connect common filters to widgets
  const widgetsWithCommonFilters = useMemo(() => {
    return widgetsWithChangeDetection.map((widget) =>
      connectToWidgetProps(widget, widgetsOptions?.[widget.id]?.filtersOptions),
    );
  }, [widgetsWithChangeDetection, widgetsOptions, connectToWidgetProps]);

  const { layoutManager: tabberLayoutManager, widgets: widgetsWithTabberConfigs } = useTabber({
    widgets: widgetsWithCommonFilters,
    config: initialDashboard.tabbersOptions,
  });

  const { layout: widgetsLayout, setLayout: setWidgetsLayout } = useWidgetsLayoutManagement({
    layout:
      initialDashboard.layoutOptions?.widgetsPanel ||
      getDefaultWidgetsPanelLayout(widgetsWithCommonFilters),
    layoutManagers: [tabberLayoutManager],
  });

  const resultLayout = useMemo(() => {
    return { ...initialDashboard.layoutOptions, widgetsPanel: widgetsLayout };
  }, [widgetsLayout, initialDashboard.layoutOptions]);

  return {
    dashboard: {
      ...initialDashboard,
      filters: commonFilters,
      widgets: widgetsWithTabberConfigs,
      layoutOptions: resultLayout,
    },
    setFilters,
    setWidgetsLayout,
  };
}

/**
 * React hook that takes in separate dashboard elements and
 * composes them into a coordinated dashboard with change detection, cross filtering, and drill down.
 *
 * @group Dashboards
 */
export const useComposedDashboard = withTracking('useComposedDashboard')(
  useComposedDashboardInternal,
);
