import { useCallback, useMemo } from 'react';
import flow from 'lodash-es/flow';
import { useCommonFilters } from '@/common-filters/use-common-filters';
import { WidgetProps } from '@/props';
import { defaultMerger, useWithChangeDetection } from '@/common/hooks/use-with-change-detection';
import cloneDeep from 'lodash-es/cloneDeep';
import { withTracking } from '@/decorators/hook-decorators';
import { useCombinedMenu } from '@/common/hooks/use-combined-menu';
import { MenuOptions } from '@/common/components/menu/types';
import { MenuIds, MenuSectionIds } from '@/common/components/menu/menu-ids';
import { DashboardProps } from './types.js';
import { Filter, FilterRelations } from '@sisense/sdk-data';
import { useSyncedState } from '@/common/hooks/use-synced-state.js';
import { useWidgetsLayoutManagement } from '@/dashboard/hooks/use-widgets-layout';
import { getDefaultWidgetsPanelLayout } from '@/dashboard/utils';
import { useTabber } from '@/dashboard/hooks/use-tabber';
import { WidgetsPanelLayout } from '@/models';
import { combineHandlers } from '@/utils/combine-handlers.js';
import { useJtd } from '@/dashboard/hooks/use-jtd';

export type ComposableDashboardProps = Pick<
  DashboardProps,
  'filters' | 'widgets' | 'widgetsOptions' | 'layoutOptions' | 'tabbersOptions'
>;

const isCommonFiltersMenu = (options: MenuOptions): boolean => {
  return options.id === MenuIds.WIDGET_POINTS_CROSSFILTERING;
};

function isDrilldownMenu(options: MenuOptions): boolean {
  return options.id === MenuIds.WIDGET_POINTS_DRILLDOWN;
}

function combineWidgetMenus(menusOptions: MenuOptions[]): MenuOptions {
  if (menusOptions.length === 1) {
    return menusOptions[0];
  }

  const commonFiltersMenuOptions = menusOptions.find((menuOptions) =>
    isCommonFiltersMenu(menuOptions),
  );
  const drilldownMenuOptions = menusOptions.find((menuOptions) => isDrilldownMenu(menuOptions));
  const jumpToDashboardMenuOptions = menusOptions.find((menuOptions) =>
    isJumpToDashboardMenu(menuOptions),
  );
  const pointsSelectionSection =
    commonFiltersMenuOptions?.itemSections[0] ?? drilldownMenuOptions?.itemSections[0];
  const combinedMenuOptions: MenuOptions = {
    position: menusOptions[0].position,
    onClose: combineHandlers(menusOptions.map(({ onClose }) => onClose)),
    itemSections: pointsSelectionSection ? [pointsSelectionSection] : [],
  };

  if (commonFiltersMenuOptions) {
    const commonFiltersMenuItemsWithoutSelectionSection =
      commonFiltersMenuOptions.itemSections.filter(
        ({ id }) => id !== MenuSectionIds.CROSSFILTERING_CHART_POINTS_SELECTION,
      );
    combinedMenuOptions.itemSections.push(...commonFiltersMenuItemsWithoutSelectionSection);
  }

  if (drilldownMenuOptions) {
    const drilldownMenuItemsWithoutSelectionSection = drilldownMenuOptions.itemSections.filter(
      ({ id }) => id !== MenuSectionIds.DRILLDOWN_CHART_POINTS_SELECTION,
    );
    combinedMenuOptions.itemSections.push(...drilldownMenuItemsWithoutSelectionSection);
  }

  if (jumpToDashboardMenuOptions) {
    combinedMenuOptions.itemSections.push(...jumpToDashboardMenuOptions.itemSections);
  }

  return combinedMenuOptions;
}

function isJumpToDashboardMenu(options: MenuOptions): boolean {
  return options.id === 'jump-to-dashboard-menu';
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
  const { openMenu } = useCombinedMenu({
    combineMenus: combineWidgetMenus,
  });
  const onBeforeInnerWidgetMenuOpen = useCallback(
    (menuOptions: MenuOptions) => {
      if (isDrilldownMenu(menuOptions)) {
        openMenu(menuOptions);
        return null;
      }
      return menuOptions;
    },
    [openMenu],
  );
  // Common filters logic (with filters state inside)
  const {
    filters: commonFilters,
    setFilters,
    connectToWidgetProps,
  } = useCommonFilters({
    initialFilters: filters,
    openMenu,
    onFiltersChange,
    onBeforeMenuOpen: onBeforeInnerWidgetMenuOpen,
  });

  const widgetFiltersMap = useMemo(() => {
    return widgets.reduce((acc, widget) => {
      acc.set(widget.id, (widget as { filters?: Filter[] }).filters || []);
      return acc;
    }, new Map<string, Filter[]>());
  }, [widgets]);

  const { connectToWidgetProps: connectToWidgetPropsJtd } = useJtd({
    widgetOptions: widgetsOptions || {},
    dashboardFilters: Array.isArray(filters) ? filters : [],
    widgetFilters: widgetFiltersMap,
    openMenu,
  });

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
      flow(
        (widget: WidgetProps) =>
          connectToWidgetProps(widget, widgetsOptions?.[widget.id]?.filtersOptions),
        connectToWidgetPropsJtd,
      )(widget),
    );
  }, [widgetsWithChangeDetection, widgetsOptions, connectToWidgetProps, connectToWidgetPropsJtd]);

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
