import { useCallback, useMemo } from 'react';

import { Filter, FilterRelations } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';

import { useCommonFilters } from '@/domains/dashboarding/common-filters/use-common-filters.js';
import type { WidgetsOptions, WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';
import { useDuplicateWidgetMenuItem } from '@/domains/dashboarding/hooks/duplicate-widget/use-duplicate-widget-menu-item.js';
import { useWidgetRenaming } from '@/domains/dashboarding/hooks/rename-widget/use-widget-renaming.js';
import { useJtdInternal } from '@/domains/dashboarding/hooks/use-jtd.js';
import { useTabber } from '@/domains/dashboarding/hooks/use-tabber.js';
import { useWidgetCsvDownload } from '@/domains/dashboarding/hooks/use-widget-csv-download.js';
import { useWidgetsLayoutManagement } from '@/domains/dashboarding/hooks/use-widgets-layout.js';
import { getDefaultWidgetsPanelLayout } from '@/domains/dashboarding/utils.js';
import type { WidgetChangeEvent } from '@/domains/widgets/change-events';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { widgetChangeEventToDelta } from '@/domains/widgets/event-to-delta';
import { useCombinedMenu } from '@/infra/contexts/menu-provider/hooks/use-combined-menu.js';
import { MenuIds, MenuSectionIds } from '@/infra/contexts/menu-provider/menu-ids';
import { MenuOptions } from '@/infra/contexts/menu-provider/types.js';
import { withTracking } from '@/infra/decorators/hook-decorators';
import { useSyncedState } from '@/shared/hooks/use-synced-state.js';
import { defaultMerger, useWithChangeDetection } from '@/shared/hooks/use-with-change-detection.js';
import { combineHandlers } from '@/shared/utils/combine-handlers.js';

import type { DashboardPersistenceManager } from './persistence/types.js';
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
  /**
   * Persistence manager for the dashboard
   * @sisenseInternal
   */
  persistence?: DashboardPersistenceManager;
  /**
   * Runtime edit mode state. When provided (e.g. by Dashboard), used for duplicate-widget visibility
   * instead of only config.widgetsPanel.editMode.isEditing.
   * @internal
   *
   * @deprecated Temporal workaround. Edit mode (with history management) should be managed by the `useComposedDashboard` hook instead of the Dashboard component.
   */
  isEditing?: boolean;
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
  { onFiltersChange, persistence, isEditing: isEditingRuntime }: UseComposedDashboardOptions = {},
): ComposedDashboardResult<D> {
  const { filters, widgets, widgetsOptions } = initialDashboard;
  // This state is needed to avoid losing the inner state when new widget objects are received from toDashboardProps.
  // Known issue: if the user forces an update with identical widgets as those already present in widgetsFromProps, it will be ignored.
  const [widgetsFromProps] = useSyncedState<WidgetProps[]>(widgets);
  // Internal widget state
  const [innerWidgets, setInnerWidgets] = useSyncedState<WidgetProps[]>(widgetsFromProps);
  // Internal widgets layout state
  const [innerWidgetsLayout, setInnerWidgetsLayout] = useSyncedState<WidgetsPanelLayout>(
    initialDashboard.layoutOptions?.widgetsPanel || getDefaultWidgetsPanelLayout(widgetsFromProps),
  );
  // Internal widgets options state
  const [innerWidgetsOptions, setInnerWidgetsOptions] = useSyncedState<WidgetsOptions>(
    widgetsOptions ?? {},
  );

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
    widgetOptions: innerWidgetsOptions ?? {},
    dashboardFilters: Array.isArray(commonFilters) ? commonFilters : [],
    widgetFilters: widgetFiltersMap,
    openMenu,
  });

  // Change detection logic
  const widgetsWithChangeDetection = useWithChangeDetection<WidgetProps, WidgetChangeEvent>({
    target: innerWidgets,
    onChange: useCallback(
      (event: WidgetChangeEvent, index?: number) => {
        setInnerWidgets((existingInnerWidgets) => {
          const isValidIndex =
            index != null &&
            Number.isInteger(index) &&
            index >= 0 &&
            index < existingInnerWidgets.length;
          if (!isValidIndex) {
            return existingInnerWidgets;
          }
          const currentWidget = existingInnerWidgets[index];
          const delta = widgetChangeEventToDelta(event, currentWidget);
          const newInnerWidgets = cloneDeep(existingInnerWidgets);
          newInnerWidgets[index] = defaultMerger(currentWidget, delta);
          return newInnerWidgets;
        });
      },
      [setInnerWidgets],
    ),
  }) as WidgetProps[];

  // Widget duplication: only when editMode is enabled, (runtime) isEditing is true, batch mode is disabled, and duplicateWidget is enabled.
  // If batch mode is enabled, the duplicate widget feature is disabled because it would not be possible to undo/redo the duplication.
  const isEditing = isEditingRuntime ?? initialDashboard.config?.widgetsPanel?.editMode?.isEditing;
  const shouldEnableWidgetDuplication = Boolean(
    initialDashboard.config?.widgetsPanel?.editMode?.enabled &&
      isEditing &&
      !initialDashboard.config?.widgetsPanel?.editMode.applyChangesAsBatch?.enabled &&
      initialDashboard.config?.widgetsPanel?.editMode?.duplicateWidget?.enabled,
  );
  const { widgets: widgetsWithDuplicate } = useDuplicateWidgetMenuItem({
    widgets: widgetsWithChangeDetection,
    setWidgets: setInnerWidgets,
    widgetsLayout: innerWidgetsLayout,
    setWidgetsLayout: setInnerWidgetsLayout,
    enabled: shouldEnableWidgetDuplication,
    widgetsOptions: innerWidgetsOptions,
    setWidgetsOptions: setInnerWidgetsOptions,
    persistence,
  });

  // Widget renaming: only when editMode is enabled, (runtime) isEditing is true, batch mode is disabled, and renameWidget is enabled.
  const shouldEnableWidgetRenaming = Boolean(
    initialDashboard.config?.widgetsPanel?.editMode?.enabled &&
      isEditing &&
      !initialDashboard.config?.widgetsPanel?.editMode.applyChangesAsBatch?.enabled &&
      initialDashboard.config?.widgetsPanel?.editMode?.renameWidget?.enabled,
  );
  const { widgets: widgetsWithRename } = useWidgetRenaming({
    widgets: widgetsWithDuplicate,
    enabled: shouldEnableWidgetRenaming,
    persistence,
  });

  const shouldEnableWidgetDownloadCsv =
    !!initialDashboard.config?.widgetsPanel?.actions?.downloadCsv?.enabled;
  const { widgets: widgetsWithDownloadCsv } = useWidgetCsvDownload({
    widgets: widgetsWithRename,
    enabled: shouldEnableWidgetDownloadCsv,
  });

  // Connect common filters to widgets
  const widgetsWithCommonFilters = useMemo(() => {
    return widgetsWithDownloadCsv.map((widget) =>
      connectToWidgetProps(widget, innerWidgetsOptions?.[widget.id]?.filtersOptions),
    );
  }, [widgetsWithDownloadCsv, innerWidgetsOptions, connectToWidgetProps]);

  const widgetsWithFilterAndJtd = useMemo(() => {
    return widgetsWithCommonFilters.map((widget: WidgetProps) => connectToWidgetPropsJtd(widget));
  }, [widgetsWithCommonFilters, connectToWidgetPropsJtd]);

  const { layoutManager: tabberLayoutManager, widgets: finalWidgets } = useTabber({
    widgets: widgetsWithFilterAndJtd,
    config: initialDashboard.config?.tabbers,
  });

  const { layout: finalWidgetsLayout, setLayout: setFinalWidgetsLayout } =
    useWidgetsLayoutManagement({
      layout: innerWidgetsLayout,
      layoutManagers: [tabberLayoutManager],
    });

  const finalLayoutOptions = useMemo(() => {
    return { ...initialDashboard.layoutOptions, widgetsPanel: finalWidgetsLayout };
  }, [finalWidgetsLayout, initialDashboard.layoutOptions]);

  return {
    dashboard: {
      ...initialDashboard,
      filters: commonFilters,
      widgets: finalWidgets,
      layoutOptions: finalLayoutOptions,
      widgetsOptions: innerWidgetsOptions,
    },
    setFilters,
    setWidgetsLayout: setFinalWidgetsLayout,
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
