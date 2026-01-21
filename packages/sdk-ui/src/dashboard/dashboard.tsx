import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Filter, FilterRelations } from '@sisense/sdk-data';

import { CONTEXT_MENU_SELECTED_WITH_DOT_CLASS } from '@/common/components/menu/context-menu/context-menu';
import { useDefaults } from '@/common/hooks/use-defaults';
import { useSyncedState } from '@/common/hooks/use-synced-state';
import { DashboardContainer } from '@/dashboard/components/dashboard-container';
import { DashboardProps, WidgetsPanelLayout } from '@/dashboard/types';
import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { ThemeProvider } from '@/theme-provider';

import { MenuItemSection } from '..';
import {
  findDeletedWidgetsFromLayout,
  updateColumnsCountInLayout,
} from './components/editable-layout/helpers';
import { EditToggle } from './components/toolbar/edit-toggle';
import { FilterToggle } from './components/toolbar/filter-toggle';
import { DEFAULT_DASHBOARD_CONFIG } from './constants';
import { useDashboardHeaderToolbar } from './hooks/use-dashboard-header-toolbar';
import { useEditModeWithHistory } from './hooks/use-edit-mode-with-history';
import { useFiltersPanelCollapsedState } from './hooks/use-filters-panel-collapsed-state';
import { useComposedDashboardInternal } from './use-composed-dashboard';
import { useDashboardThemeInternal } from './use-dashboard-theme';
import { getDefaultWidgetsPanelLayout } from './utils';

enum DashboardMode {
  VIEW = 'view',
  EDIT = 'edit',
}

/**
 * React component that renders a dashboard whose elements are customizable. It includes internal logic of applying common filters to widgets.
 *
 * **Note:** Dashboard and Widget extensions based on JS scripts and add-ons in Fusion – for example, Blox and Jump To Dashboard – are not supported.
 *
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
    title = '',
    layoutOptions,
    config: propConfig,
    widgets,
    filters,
    defaultDataSource,
    widgetsOptions,
    styleOptions,
    onChange,
  }: DashboardProps) => {
    const { themeSettings } = useDashboardThemeInternal({ styleOptions });
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
      config?.toolbar?.visible !== false &&
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

    const headerToolbarComponents = useMemo(() => {
      const components: JSX.Element[] = [];

      if (isEditModeEnabled) {
        components.push(
          <EditToggle
            key="edit-toggle"
            isEditMode={isEditMode}
            isHistoryEnabled={isHistoryEnabled}
            color={themeSettings.dashboard.toolbar.primaryTextColor}
            onToggleClick={() =>
              handleModeChange(isEditMode ? DashboardMode.VIEW : DashboardMode.EDIT)
            }
          />,
        );
      }

      // Add filter toggle component when showFilterIconInToolbar is enabled and both toolbar and filters panel are visible
      if (showFilterIconInToolbar) {
        components.push(
          <FilterToggle
            key="filter-toggle"
            isFilterPanelCollapsed={isFilterPanelCollapsed}
            color={themeSettings.dashboard.toolbar.primaryTextColor}
            onToggleClick={handleFilterToggleClick}
          />,
        );
      }

      return components;
    }, [
      showFilterIconInToolbar,
      isFilterPanelCollapsed,
      handleFilterToggleClick,
      handleModeChange,
      isEditMode,
      isEditModeEnabled,
      isHistoryEnabled,
      themeSettings.dashboard.toolbar.primaryTextColor,
    ]);

    const { toolbar: headerToolbar } = useDashboardHeaderToolbar({
      menuItemSections: headerToolbarMenuItemSections,
      toolbarComponents: headerToolbarComponents,
    });

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
      },
      setFilters,
    } = useComposedDashboardInternal(
      {
        filters,
        widgets,
        widgetsOptions,
        layoutOptions: innerLayoutOptions,
        config: propConfig,
      },
      {
        onFiltersChange: useCallback(
          (filters: Filter[] | FilterRelations) => {
            onChange?.({ type: 'filters/updated', payload: filters });
          },
          [onChange],
        ),
      },
    );

    return (
      <ThemeProvider theme={themeSettings}>
        <DashboardContainer
          title={title}
          editMode={isEditMode}
          layoutOptions={updatedLayoutOptions}
          config={config}
          widgets={dashboardWidgets}
          defaultDataSource={defaultDataSource}
          filters={dashboardFilters}
          onFiltersChange={setFilters}
          onLayoutChange={layoutChangeHandler}
          filterPanelCollapsed={isFilterPanelCollapsed}
          onFilterPanelCollapsedChange={handleFilterToggleClick}
          renderToolbar={() => (
            <>
              {isEditMode && isHistoryEnabled && editModeToolbar()}
              {headerToolbar()}
            </>
          )}
        />
      </ThemeProvider>
    );
  },
);
