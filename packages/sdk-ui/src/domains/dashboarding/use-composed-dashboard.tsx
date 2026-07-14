import { SetStateAction, useCallback, useEffect, useMemo, useRef } from 'react';

import { Filter, FilterRelations } from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep';

import { resolveFilterWidgetFilter } from '@/domains/dashboarding/common-filters/filter-widget-connector.js';
import { useCommonFilters } from '@/domains/dashboarding/common-filters/use-common-filters.js';
import { findDeletedWidgetsFromLayout } from '@/domains/dashboarding/components/editable-layout/helpers.js';
import type { WidgetsOptions, WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';
import { useDuplicateWidgetMenuItem } from '@/domains/dashboarding/hooks/duplicate-widget/use-duplicate-widget-menu-item.js';
import { useWidgetRenaming } from '@/domains/dashboarding/hooks/rename-widget/use-widget-renaming.js';
import { useJtdInternal } from '@/domains/dashboarding/hooks/use-jtd.js';
import { TabbersConfig, useTabber } from '@/domains/dashboarding/hooks/use-tabber.js';
import { useWidgetCsvDownload } from '@/domains/dashboarding/hooks/use-widget-csv-download.js';
import { useWidgetExcelDownload } from '@/domains/dashboarding/hooks/use-widget-excel-download.js';
import { useWidgetUpdatesPersistence } from '@/domains/dashboarding/hooks/use-widget-updates-persistence.js';
import { useWidgetsLayoutManagement } from '@/domains/dashboarding/hooks/use-widgets-layout.js';
import {
  getDefaultWidgetsPanelLayout,
  withResolvedWidgetDataSource,
  withWidgetAppendedToPanelLayout,
} from '@/domains/dashboarding/utils.js';
import type { WidgetChangeEvent } from '@/domains/widgets/change-events';
import { isFilterWidgetProps } from '@/domains/widgets/components/widget-by-id/utils.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { widgetChangeEventToDelta } from '@/domains/widgets/event-to-delta';
import { useCombinedMenu } from '@/infra/contexts/menu-provider/hooks/use-combined-menu.js';
import { MenuIds, MenuSectionIds } from '@/infra/contexts/menu-provider/menu-ids';
import { MenuOptions } from '@/infra/contexts/menu-provider/types.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context.js';
import { withTracking } from '@/infra/decorators/hook-decorators';
import { useModuleApiRegistry } from '@/infra/modules';
import { useSyncedState } from '@/shared/hooks/use-synced-state.js';
import { defaultMerger, useWithChangeDetection } from '@/shared/hooks/use-with-change-detection.js';
import { combineHandlers } from '@/shared/utils/combine-handlers.js';
import { getFiltersArray } from '@/shared/utils/filter-relations.js';

import { DashboardModule } from './dashboard-module/dashboard-module.js';
import type { DashboardStateApi } from './dashboard-module/types.js';
import type { DashboardPersistenceManager } from './persistence/types.js';
import { DashboardConfig, DashboardProps } from './types.js';

function widgetExistsInLayout(layout: WidgetsPanelLayout, widgetId: string): boolean {
  return (
    layout.columns?.some((col) =>
      col.rows?.some((row) => row.cells?.some((cell) => cell.widgetId === widgetId)),
    ) ?? false
  );
}

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
   * Called with every widget change event emitted through a widget's unified
   * `onChange` channel (e.g. dateLevel/changed), after local state is updated.
   * Lets the Dashboard component forward selected events to the host bridge.
   *
   * @internal
   */
  onWidgetChangeEvent?: (widgetId: string, event: WidgetChangeEvent) => void;
  /**
   * Persistence manager for the dashboard
   *
   * @sisenseInternal
   */
  persistence?: DashboardPersistenceManager;
  /**
   * Runtime edit mode state. When provided (e.g. by Dashboard), used for duplicate-widget visibility
   * instead of only config.widgetsPanel.editMode.isEditing.
   *
   * @internal
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

  /**
   * Filter guids that should be hidden in the FiltersPanel because they are
   * claimed by a live FilterWidget in the current layout.
   *
   * @internal
   */
  hiddenFilterIds: string[];
};

/**
 * {@link useComposedDashboard} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useComposedDashboardInternal<D extends ComposableDashboardProps | DashboardProps>(
  initialDashboard: D,
  {
    onFiltersChange,
    onWidgetChangeEvent,
    persistence,
    isEditing: isEditingRuntime,
  }: UseComposedDashboardOptions = {},
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
  // Internal dashboard config state.
  const [innerConfig, setInnerConfig] = useSyncedState<DashboardConfig | undefined>(
    initialDashboard.config,
  );
  const { app } = useSisenseContext();

  // Exposes just the `tabbers` slice as a setState-style updater, so the duplicate-widget hook
  // can carry a tabber's show/hide mapping to the clone without owning the whole config object.
  const setTabbersConfig = useCallback(
    (update: SetStateAction<TabbersConfig>) =>
      setInnerConfig((prev) => ({
        ...prev,
        tabbers: typeof update === 'function' ? update(prev?.tabbers ?? {}) : update,
      })),
    [setInnerConfig],
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
          // Let the Dashboard component forward selected events to the host
          // bridge (e.g. dateLevel/changed -> Fusion widget metadata sync).
          onWidgetChangeEvent?.(currentWidget.id, event);
          return newInnerWidgets;
        });
      },
      [setInnerWidgets, onWidgetChangeEvent],
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
    tabbersConfig: innerConfig?.tabbers,
    setTabbersConfig,
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

  const shouldEnableWidgetDownloadExcel =
    !!initialDashboard.config?.widgetsPanel?.actions?.downloadExcel?.enabled;
  const { widgets: widgetsWithDownloadExcel } = useWidgetExcelDownload({
    widgets: widgetsWithDownloadCsv,
    enabled: shouldEnableWidgetDownloadExcel,
  });

  // Connect common filters to widgets
  const widgetsWithCommonFilters = useMemo(() => {
    return widgetsWithDownloadExcel.map((widget) =>
      connectToWidgetProps(widget, {
        ...innerWidgetsOptions?.[widget.id]?.filtersOptions,
        filterWidgetOptions: innerWidgetsOptions?.[widget.id]?.filterWidgetOptions,
        setFilterWidgetOptions: (opts: { filterId: string }) =>
          setInnerWidgetsOptions((prev) => ({
            ...prev,
            [widget.id]: { ...prev?.[widget.id], filterWidgetOptions: opts },
          })),
      }),
    );
  }, [widgetsWithDownloadExcel, innerWidgetsOptions, connectToWidgetProps, setInnerWidgetsOptions]);

  const widgetsWithFilterAndJtd = useMemo(() => {
    return widgetsWithCommonFilters.map((widget: WidgetProps) => connectToWidgetPropsJtd(widget));
  }, [widgetsWithCommonFilters, connectToWidgetPropsJtd]);

  const { widgets: widgetsWithFilterAndJtdAndScrollSaver } = useWidgetUpdatesPersistence(
    widgetsWithFilterAndJtd,
    setInnerWidgets,
    persistence,
  );

  const { layoutManager: tabberLayoutManager, widgets: finalWidgets } = useTabber({
    widgets: widgetsWithFilterAndJtdAndScrollSaver,
    config: innerConfig?.tabbers,
  });

  const { layout: finalWidgetsLayout, setLayout: setFinalWidgetsLayout } =
    useWidgetsLayoutManagement({
      layout: innerWidgetsLayout,
      layoutManagers: [tabberLayoutManager],
    });

  const finalLayoutOptions = useMemo(() => {
    return { ...initialDashboard.layoutOptions, widgetsPanel: finalWidgetsLayout };
  }, [finalWidgetsLayout, initialDashboard.layoutOptions]);

  const shouldHideFilterWidgetFilters =
    (initialDashboard as Partial<DashboardProps>).config?.filtersPanel
      ?.hideFilterWidgetLinkedFilters !== false;

  const hiddenFilterIds = useMemo<string[]>(() => {
    if (!shouldHideFilterWidgetFilters) return [];
    const allFilters = getFiltersArray(commonFilters);
    return finalWidgets
      .filter(isFilterWidgetProps)
      .filter((w) => widgetExistsInLayout(finalWidgetsLayout, w.id))
      .flatMap((w) => {
        // Same resolution rule as the FilterWidget connector: attribute identity is
        // authoritative, the guid link is only a re-validated hint. Covers filters
        // created externally (e.g. by PWC's syncFilterWithWidget) before the first
        // interaction, and ignores stale links after an external attribute edit.
        const { filter } = resolveFilterWidgetFilter(
          allFilters,
          w.attribute,
          innerWidgetsOptions?.[w.id]?.filterWidgetOptions,
        );
        return filter ? [filter.config.guid] : [];
      });
  }, [
    finalWidgets,
    finalWidgetsLayout,
    innerWidgetsOptions,
    shouldHideFilterWidgetFilters,
    commonFilters,
  ]);

  // Deleting a FilterWidget must also remove its linked dashboard filter (design
  // requirement — the filter is "removed together with the widget"). Detection uses the
  // pre-tabber `innerWidgetsLayout`: a genuine deletion drops the widget id from it,
  // whereas tabber tab-switching only reshapes the post-tabber `finalWidgetsLayout`, so
  // this never mistakes a hidden-tab widget for a deleted one. Read the rest of the
  // context from a ref so the effect fires on layout changes only, not on filter changes.
  const deletionContextRef = useRef({
    finalWidgets,
    commonFilters,
    innerWidgetsOptions,
    setFilters,
  });
  deletionContextRef.current = {
    finalWidgets,
    commonFilters,
    innerWidgetsOptions,
    setFilters,
  };
  const prevWidgetsLayoutRef = useRef(innerWidgetsLayout);
  useEffect(() => {
    const deletedWidgetIds = findDeletedWidgetsFromLayout(
      prevWidgetsLayoutRef.current,
      innerWidgetsLayout,
    );
    prevWidgetsLayoutRef.current = innerWidgetsLayout;
    if (deletedWidgetIds.length === 0) return;

    const {
      finalWidgets: widgets,
      commonFilters: currentFilters,
      innerWidgetsOptions: options,
      setFilters: applyFilters,
    } = deletionContextRef.current;
    const allFilters = getFiltersArray(currentFilters);
    const removedGuids = new Set<string>();
    deletedWidgetIds.forEach((id) => {
      const widget = widgets.find((w) => w.id === id);
      if (!widget || !isFilterWidgetProps(widget)) return;
      const { filter } = resolveFilterWidgetFilter(
        allFilters,
        widget.attribute,
        options?.[id]?.filterWidgetOptions,
      );
      if (filter) removedGuids.add(filter.config.guid);
    });
    if (removedGuids.size === 0) return;
    applyFilters(allFilters.filter((f) => !removedGuids.has(f.config.guid)));
  }, [innerWidgetsLayout]);

  const dashboardDefaultDataSource = (initialDashboard as Partial<DashboardProps>)
    .defaultDataSource;

  // Adds a widget to the dashboard. Persists automatically when a persistence manager is configured,
  // otherwise updates local state only.
  const addWidget = useCallback<DashboardStateApi['addWidget']>(
    (widget, options = {}): void => {
      const { widgetOptions, widgetsPanelLayout } = options;
      const normalizedWidget = withResolvedWidgetDataSource([
        dashboardDefaultDataSource,
        app?.defaultDataSource,
      ])(widget);
      const newLayout =
        widgetsPanelLayout ??
        withWidgetAppendedToPanelLayout(normalizedWidget.id)(innerWidgetsLayout);

      if (!persistence) {
        setInnerWidgets((prev) => [...prev, normalizedWidget]);
        setInnerWidgetsLayout(newLayout);
        if (widgetOptions) {
          setInnerWidgetsOptions((prev) => ({ ...prev, [normalizedWidget.id]: widgetOptions }));
        }
        return;
      }
      void persistence
        .addWidget(normalizedWidget, newLayout, widgetOptions)
        .then(
          ({
            widget: storedWidget,
            widgetsPanelLayout: storedLayout,
            widgetOptions: storedWidgetOptions,
          }) => {
            setInnerWidgets((prev) => [...prev, storedWidget]);
            setInnerWidgetsLayout(storedLayout);
            if (storedWidgetOptions) {
              setInnerWidgetsOptions((prev) => ({
                ...prev,
                [storedWidget.id]: storedWidgetOptions,
              }));
            }
          },
        )
        .catch((error) => {
          console.error('[useComposedDashboard] Failed to persist added widget:', error);
        });
    },
    [
      innerWidgetsLayout,
      persistence,
      dashboardDefaultDataSource,
      app,
      setInnerWidgets,
      setInnerWidgetsLayout,
      setInnerWidgetsOptions,
    ],
  );

  const stateApi = useMemo<DashboardStateApi>(
    () => ({ addWidget, setFilters, setWidgetsLayout: setFinalWidgetsLayout }),
    [addWidget, setFilters, setFinalWidgetsLayout],
  );

  // Apply customizations contributed by other modules.
  const customizations = useModuleApiRegistry(DashboardModule, 'customizations');
  const composedDashboard: DashboardProps = {
    ...initialDashboard,
    filters: commonFilters,
    widgets: finalWidgets,
    layoutOptions: finalLayoutOptions,
    widgetsOptions: innerWidgetsOptions,
    ...(innerConfig ? { config: innerConfig } : {}),
  };
  const customizedDashboard = customizations.reduce<DashboardProps>((current, customize) => {
    try {
      return customize(current, stateApi);
    } catch (error) {
      console.error('[useComposedDashboard] Dashboard customization failed:', error);
      return current;
    }
  }, composedDashboard);

  return {
    dashboard: customizedDashboard as D,
    setFilters,
    setWidgetsLayout: setFinalWidgetsLayout,
    hiddenFilterIds,
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
 * @template {D extends ComposableDashboardProps | DashboardProps} D - The type parameter for a dashboard properties, restricted to ComposableDashboardProps or DashboardProps
 * @param {D} initialDashboard - set of properties for the Dashboard component
 * @param {UseComposedDashboardOptions} [options] - Options for the composable.
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
