import { useCallback, useMemo } from 'react';

import { Filter, FilterRelations } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';

import { useCommonFilters } from '@/domains/dashboarding/common-filters/use-common-filters.js';
import { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';
import { useJtdInternal } from '@/domains/dashboarding/hooks/use-jtd.js';
import { useTabber } from '@/domains/dashboarding/hooks/use-tabber.js';
import { useWidgetsLayoutManagement } from '@/domains/dashboarding/hooks/use-widgets-layout.js';
import { getDefaultWidgetsPanelLayout } from '@/domains/dashboarding/utils.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { useCombinedMenu } from '@/infra/contexts/menu-provider/hooks/use-combined-menu.js';
import { MenuIds, MenuSectionIds } from '@/infra/contexts/menu-provider/menu-ids';
import { MenuOptions } from '@/infra/contexts/menu-provider/types.js';
import { withTracking } from '@/infra/decorators/hook-decorators';
import { useSyncedState } from '@/shared/hooks/use-synced-state.js';
import { defaultMerger, useWithChangeDetection } from '@/shared/hooks/use-with-change-detection.js';
import { combineHandlers } from '@/shared/utils/combine-handlers.js';

import { DashboardProps } from './types.js';

export type ComposableDashboardProps = Pick<
  DashboardProps,
  'filters' | 'widgets' | 'widgetsOptions' | 'layoutOptions' | 'config'
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
 * Result of the {@link useComposedDashboard} hook.
 */
export type ComposedDashboardResult<D extends ComposableDashboardProps | DashboardProps> = {
  /** The composable dashboard object containing the current state of the dashboard. */
  dashboard: D;

  /** API to set filters on the dashboard. */
  setFilters: (filters: Filter[] | FilterRelations) => void;

  /** API to set the layout of the widgets on the dashboard. */
  setWidgetsLayout: (newLayout: WidgetsPanelLayout) => void;
};

/**
 * {@link useComposedDashboard} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useComposedDashboardInternal<D extends ComposableDashboardProps | DashboardProps>(
  initialDashboard: D,
  { onFiltersChange }: UseComposedDashboardOptions = {},
): ComposedDashboardResult<D> {
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
    return innerWidgets.reduce((acc, widget) => {
      acc.set(widget.id, (widget as { filters?: Filter[] }).filters || []);
      return acc;
    }, new Map<string, Filter[]>());
  }, [innerWidgets]);

  const { connectToWidgetProps: connectToWidgetPropsJtd } = useJtdInternal({
    widgetOptions: widgetsOptions || {},
    dashboardFilters: Array.isArray(commonFilters) ? commonFilters : [],
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
      connectToWidgetProps(widget, widgetsOptions?.[widget.id]?.filtersOptions),
    );
  }, [widgetsWithChangeDetection, widgetsOptions, connectToWidgetProps]);

  const widgetsWithFilterAndJtd = useMemo(() => {
    return widgetsWithCommonFilters.map((widget: WidgetProps) => connectToWidgetPropsJtd(widget));
  }, [widgetsWithCommonFilters, connectToWidgetPropsJtd]);

  const { layoutManager: tabberLayoutManager, widgets: widgetsWithTabberConfigs } = useTabber({
    widgets: widgetsWithFilterAndJtd,
    config: initialDashboard.config?.tabbers,
  });

  const { layout: widgetsLayout, setLayout: setWidgetsLayout } = useWidgetsLayoutManagement({
    layout:
      initialDashboard.layoutOptions?.widgetsPanel ||
      getDefaultWidgetsPanelLayout(widgetsWithFilterAndJtd),
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
 * @example
 * ```ts
 * import { useComposedDashboard } from '@sisense/sdk-ui/dashboard/use-composed-dashboard.js';
 * import { Widget } from '@sisense/sdk-ui';
 * import { DashboardProps } from '@/dashboard/types.js';
 * import { FilterTile } from '@/filters';
 *
 * const CodeExample = () => {
 *   const dashboardProps: DashboardProps = { ... };
 *
 *   const {
 *     dashboard: { title, widgets, filters = [] }
 *   } = useComposedDashboard(dashboardProps);
 *
 *   return (
 *     <div>
 *       <span>{title}</span>
 *       <div>
 *         {widgets.map((widget) => (
 *           <Widget key={widget.id} {...widget} />
 *         ))}
 *       </div>
 *
 *       {Array.isArray(filters) ? filters.map((filter) => (
 *         <FilterTile
 *           key={filter.name}
 *           filter={filter}
 *           onChange={(filter) => console.log('Updated filter', filter)}
 *         />
 *       )) : null}
 *     </div>
 *   );
 * }
 *   export default CodeExample;
 * ```
 *
 * @template {D extends ComposableDashboardProps | DashboardProps} D - The type parameter for a dashboard properties, restricted to ComposableDashboardProps or DashboardProps
 * @param {D} initialDashboard - set of properties for the Dashboard component
 * @param {UseComposedDashboardOptions} [options] - Options for the composable.
 *
 * @return {ComposedDashboardResult} An object containing the composed dashboard and APIs to interact with it.
 * @group Dashboards
 */
export const useComposedDashboard = <D extends ComposableDashboardProps | DashboardProps>(
  initialDashboard: D,
  options: UseComposedDashboardOptions = {},
): ComposedDashboardResult<D> => {
  return withTracking('useComposedDashboard')(useComposedDashboardInternal)(
    initialDashboard,
    options,
  );
};
