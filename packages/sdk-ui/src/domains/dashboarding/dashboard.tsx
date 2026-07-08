import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Filter, FilterRelations } from '@sisense/sdk-data';

import { DashboardContainer } from '@/domains/dashboarding/components/dashboard-container';
import { DashboardHeaderTargets } from '@/domains/dashboarding/components/dashboard-header/dashboard-header-targets';
import { DashboardProps, WidgetsPanelLayout } from '@/domains/dashboarding/types';
import { HeaderItem } from '@/domains/shared/header';
import { ThemeProvider } from '@/infra/contexts/theme-provider';
import { asSisenseComponent } from '@/infra/decorators/component-decorators/as-sisense-component';
import { CONTEXT_MENU_SELECTED_WITH_DOT_CLASS } from '@/shared/components/menu/context-menu/context-menu';
import { useDefaults } from '@/shared/hooks/use-defaults';
import { useSyncedState } from '@/shared/hooks/use-synced-state';

import { MenuItemSection } from '../..';
import {
  findDeletedWidgetsFromLayout,
  updateColumnsCountInLayout,
} from './components/editable-layout/helpers';
import { EditToggle } from './components/toolbar/edit-toggle';
import { FilterToggle } from './components/toolbar/filter-toggle';
import { DEFAULT_DASHBOARD_CONFIG } from './constants';
import { useDashboardHeaderMenuItem } from './hooks/use-dashboard-header-menu-item';
import { useEditModeWithHistory } from './hooks/use-edit-mode-with-history';
import { useFiltersPanelCollapsedState } from './hooks/use-filters-panel-collapsed-state';
import { useComposedDashboardInternal } from './use-composed-dashboard';
import { useDashboardThemeInternal } from './use-dashboard-theme';
import { getDefaultWidgetsPanelLayout, isDashboardHeaderVisible } from './utils';

enum DashboardMode {
  VIEW = 'view',
  EDIT = 'edit',
}

/**
 * React component that renders a dashboard whose elements are customizable. It includes internal logic of applying common filters to widgets.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 * @example
 *
 * Example of rendering a Fusion dashboard using the `useGetDashboardModel hook and the `Dashboard` component.
 *
 * ```ts
 * import { Dashboard, useGetDashboardModel, dashboardModelTranslator } from '@sisense/sdk-ui';

const CodeExample = () => {
  const { dashboard } = useGetDashboardModel({
    dashboardOid: '65a82171719e7f004018691c',
    includeFilters: true,
    includeWidgets: true,
  });

  return (
    <>
      {dashboard && (
        <Dashboard {...dashboardModelTranslator.toDashboardProps(dashboard)} />
      )}
    </>
  );
};

export default CodeExample;
 * ```
 *
 * To learn more about this and related dashboard components,
 * see [Embedded Dashboards](/guides/sdk/guides/dashboards/index.html).
 * @group Dashboards
 */
export const Dashboard = asSisenseComponent({
  componentName: 'Dashboard',
  shouldHaveOwnModalRoot: true,
})(
  ({
    id,
    title = '',
    layoutOptions,
    config: propConfig,
    widgets,
    filters,
    defaultDataSource,
    widgetsOptions,
    styleOptions,
    onChange,
    persistence,
  }: DashboardProps) => {
    const config = useDefaults(propConfig, DEFAULT_DASHBOARD_CONFIG);
    const { t } = useTranslation();

    const [internalLayout, setInternalLayout] = useSyncedState(layoutOptions?.widgetsPanel);

    const [mode, setMode] = useState<DashboardMode>(DashboardMode.VIEW);
    const editMode = config?.widgetsPanel?.editMode;
    const isEditModeEnabled = Boolean(editMode?.enabled);
    const isModeStateForced = 'isEditing' in (editMode ?? {});
    const isEditMode = Boolean(
      isEditModeEnabled && (isModeStateForced ? editMode?.isEditing : mode === DashboardMode.EDIT),
    );
    const isHistoryEnabled = Boolean(isEditModeEnabled && editMode?.applyChangesAsBatch?.enabled);

    const updatedLayout = useMemo(() => {
      return internalLayout ?? getDefaultWidgetsPanelLayout(widgets);
    }, [internalLayout, widgets]);

    const handleModeChange = useCallback(
      (newMode: DashboardMode) => {
        if (!isModeStateForced) setMode(newMode);
        onChange?.({
          type: 'widgetsPanel/editMode/isEditing/changed',
          payload: newMode === DashboardMode.EDIT,
        });
      },
      [onChange, isModeStateForced, setMode],
    );

    const {
      layout: editModeLayoutWithHistory,
      setLayout: setEditModeLayoutWithHistory,
      toolbar: editModeToolbar,
    } = useEditModeWithHistory({
      initialLayout: updatedLayout,
      historyCapacity: editMode?.applyChangesAsBatch?.historyLimit,
      onApply: () => {
        handleLayoutChange(editModeLayoutWithHistory);
        handleModeChange(DashboardMode.VIEW);
      },
      onCancel: () => handleModeChange(DashboardMode.VIEW),
    });
    const editingLayout = isHistoryEnabled ? editModeLayoutWithHistory : updatedLayout;

    const handleLayoutChange = useCallback(
      (changedLayout: WidgetsPanelLayout) => {
        const deletedWidgets = findDeletedWidgetsFromLayout(updatedLayout, changedLayout);
        setInternalLayout(changedLayout);

        onChange?.({
          type: 'widgetsPanel/layout/updated',
          payload: changedLayout,
        });
        if (deletedWidgets.length > 0) {
          onChange?.({
            type: 'widgets/deleted',
            payload: deletedWidgets,
          });
        }
      },
      [onChange, updatedLayout, setInternalLayout],
    );

    const currentColumnsCount = editingLayout.columns.length;
    const showFilterIconInToolbar =
      !!config?.filtersPanel?.showFilterIconInToolbar &&
      isDashboardHeaderVisible(config) &&
      config?.filtersPanel?.visible !== false;

    const layoutChangeHandler = useCallback(
      (updatedLayout: WidgetsPanelLayout) => {
        if (isHistoryEnabled) {
          setEditModeLayoutWithHistory(updatedLayout);
        } else {
          handleLayoutChange(updatedLayout);
        }
      },
      [isHistoryEnabled, setEditModeLayoutWithHistory, handleLayoutChange],
    );

    const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useFiltersPanelCollapsedState(
      config?.filtersPanel?.collapsedInitially,
      config?.filtersPanel?.persistCollapsedStateToLocalStorage,
    );
    const handleFilterToggleClick = useCallback(() => {
      setIsFilterPanelCollapsed(!isFilterPanelCollapsed);
      onChange?.({
        type: 'filtersPanel/collapse/changed',
        payload: !isFilterPanelCollapsed,
      });
    }, [onChange, setIsFilterPanelCollapsed, isFilterPanelCollapsed]);

    const headerToolbarMenuItemSections = useMemo(() => {
      const sections: MenuItemSection[] = [];
      if (isEditMode) {
        sections.push({
          items: [
            {
              caption: t('dashboard.toolbar.columns'),
              subItems: [
                {
                  items: Array.from({ length: 4 }, (_, index) => {
                    const columnCount = index + 1;
                    const translationKey =
                      columnCount === 1 ? 'dashboard.toolbar.column' : 'dashboard.toolbar.columns';

                    return {
                      caption: `${columnCount} ${t(translationKey)}`,
                      class:
                        currentColumnsCount === columnCount
                          ? CONTEXT_MENU_SELECTED_WITH_DOT_CLASS
                          : '',
                      onClick: () =>
                        layoutChangeHandler(updateColumnsCountInLayout(editingLayout, columnCount)),
                    };
                  }),
                },
              ],
            },
          ],
        });
      }
      return sections;
    }, [isEditMode, currentColumnsCount, layoutChangeHandler, editingLayout, t]);

    // Built-in header action items, ordered left-to-right (after the title): edit-mode toolbar,
    // edit toggle, filter toggle, menu. Each is always present so it can anchor `before`/`after`
    // positioning, and carries `hidden: true` when the current config shouldn't render it.
    const editModeToolbarItem = useMemo<HeaderItem>(
      () => ({
        id: DashboardHeaderTargets.EditModeToolbar,
        fill: 'content',
        hidden: !(isEditMode && isHistoryEnabled),
        component: () => <>{editModeToolbar()}</>,
      }),
      [isEditMode, isHistoryEnabled, editModeToolbar],
    );

    const menuItem = useDashboardHeaderMenuItem(headerToolbarMenuItemSections);

    const innerLayoutOptions = useMemo(() => {
      return {
        ...layoutOptions,
        widgetsPanel: editingLayout,
      };
    }, [layoutOptions, editingLayout]);

    const {
      dashboard: {
        filters: dashboardFilters = [],
        widgets: dashboardWidgets,
        layoutOptions: updatedLayoutOptions,
        config: composedConfig,
        title: composedTitle,
        defaultDataSource: composedDefaultDataSource,
        styleOptions: composedStyleOptions,
      },
      setFilters,
    } = useComposedDashboardInternal(
      {
        id,
        title,
        filters,
        widgets,
        widgetsOptions,
        layoutOptions: innerLayoutOptions,
        config: propConfig,
        defaultDataSource,
        styleOptions,
      },
      {
        onFiltersChange: useCallback(
          (filters: Filter[] | FilterRelations) => {
            onChange?.({ type: 'filters/updated', payload: filters });
          },
          [onChange],
        ),
        persistence,
        isEditing: isEditMode,
      },
    );

    // Theme and config are derived from the composed dashboard so that module customizations
    // to styleOptions and config are reflected in the rendered output.
    const { themeSettings } = useDashboardThemeInternal({ styleOptions: composedStyleOptions });
    const composedConfigWithDefaults = useDefaults(composedConfig, DEFAULT_DASHBOARD_CONFIG);

    const editToggleItem = useMemo<HeaderItem>(
      () => ({
        id: DashboardHeaderTargets.EditToggle,
        fill: 'content',
        // Keeping it a hidden anchor while edit mode is unavailable, and — in history mode — while editing, where the
        // edit-mode toolbar replaces it.
        hidden: !isEditModeEnabled || (isEditMode && isHistoryEnabled),
        component: ({ size }) => (
          <EditToggle
            isEditMode={isEditMode}
            isHistoryEnabled={isHistoryEnabled}
            color={themeSettings.dashboard.toolbar.primaryTextColor}
            size={size.height}
            onToggleClick={() =>
              handleModeChange(isEditMode ? DashboardMode.VIEW : DashboardMode.EDIT)
            }
          />
        ),
      }),
      [
        isEditModeEnabled,
        isEditMode,
        isHistoryEnabled,
        themeSettings.dashboard.toolbar.primaryTextColor,
        handleModeChange,
      ],
    );

    const filterToggleItem = useMemo<HeaderItem>(
      () => ({
        id: DashboardHeaderTargets.FilterToggle,
        fill: 'content',
        // Visible only when showFilterIconInToolbar is enabled and both toolbar and filters panel
        // are visible; otherwise kept as an anchor.
        hidden: !showFilterIconInToolbar,
        component: ({ size }) => (
          <FilterToggle
            isFilterPanelCollapsed={isFilterPanelCollapsed}
            color={themeSettings.dashboard.toolbar.primaryTextColor}
            size={size.height}
            onToggleClick={handleFilterToggleClick}
          />
        ),
      }),
      [
        showFilterIconInToolbar,
        isFilterPanelCollapsed,
        handleFilterToggleClick,
        themeSettings.dashboard.toolbar.primaryTextColor,
      ],
    );

    const headerItems = useMemo<HeaderItem[]>(
      () => [editModeToolbarItem, editToggleItem, filterToggleItem, menuItem],
      [editModeToolbarItem, editToggleItem, filterToggleItem, menuItem],
    );

    return (
      <ThemeProvider theme={themeSettings}>
        <DashboardContainer
          title={composedTitle ?? ''}
          editMode={isEditMode}
          layoutOptions={updatedLayoutOptions}
          config={composedConfigWithDefaults}
          widgets={dashboardWidgets}
          defaultDataSource={composedDefaultDataSource}
          filters={dashboardFilters}
          onFiltersChange={setFilters}
          onLayoutChange={layoutChangeHandler}
          filterPanelCollapsed={isFilterPanelCollapsed}
          onFilterPanelCollapsedChange={handleFilterToggleClick}
          headerItems={headerItems}
          headerConfig={composedConfig?.header}
        />
      </ThemeProvider>
    );
  },
);
