import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import { DataSource } from '@sisense/sdk-data';

import { CONTEXT_MENU_SELECTED_WITH_DOT_CLASS } from '@/common/components/menu/context-menu/context-menu';
import { useSyncedState } from '@/common/hooks/use-synced-state';
import { ContentPanel } from '@/dashboard/components/content-panel';
import { DashboardHeader } from '@/dashboard/components/dashboard-header';
import { EditableLayout } from '@/dashboard/components/editable-layout/editable-layout';
import { HorizontalCollapse } from '@/dashboard/components/horizontal-collapse';
import { useFiltersPanelCollapsedState } from '@/dashboard/hooks/use-filters-panel-collapsed-state';
import { DashboardContainerProps, WidgetsPanelLayout } from '@/dashboard/types';
import { getDefaultWidgetsPanelLayout, getDividerStyle } from '@/dashboard/utils';
import { FiltersPanel } from '@/filters';
import { MenuItemSection, WidgetProps } from '@/props';
import { ThemeProvider, useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { getDataSourceTitle } from '@/utils/data-sources-utils';

import { useDashboardHeaderToolbar } from '../hooks/use-dashboard-header-toolbar';
import { useEditModeToolbar } from '../hooks/use-edit-mode-toolbar';
import {
  findDeletedWidgetsFromLayout,
  updateColumnsCountInLayout,
} from './editable-layout/helpers';
import { EditToggle } from './toolbar/edit-toggle';
import { FilterToggle } from './toolbar/filter-toggle';

enum DashboardMode {
  VIEW = 'view',
  EDIT = 'edit',
}

const DashboardWrapper = styled.div<Themable>`
  max-width: 100%;
  background-color: ${({ theme }) => theme.dashboard.backgroundColor};
  color: ${({ theme }) => theme.typography.primaryTextColor};
  display: flex;
  max-height: 100%;
  border: ${({ theme }) =>
    getDividerStyle(theme.dashboard.borderColor, theme.dashboard.borderWidth)};
`;

const ContentColumn = styled.div<Themable & { showRightBorder: boolean }>`
  background-color: ${({ theme }) => theme.dashboard.backgroundColor};
  flex-grow: 1;
  flex-shrink: 1;

  display: flex;
  flex-direction: column;
  max-height: 100%;
`;

const ContentPanelWrapper = styled.div<{
  responsive?: boolean;
}>`
  max-height: 100%;
  overflow: auto;
  container-type: ${({ responsive }) => (responsive ? 'inline-size' : 'unset')};
  container-name: content-panel-container;
`;

export const DashboardContainer = ({
  title,
  layoutOptions,
  config,
  widgets,
  filters,
  onFiltersChange,
  defaultDataSource,
  onChange,
}: DashboardContainerProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  const [internalLayout, setInternalLayout] = useSyncedState(layoutOptions?.widgetsPanel);
  const updatedLayout = useMemo(() => {
    return internalLayout ?? getDefaultWidgetsPanelLayout(widgets);
  }, [internalLayout, widgets]);

  const [mode, setMode] = useState<DashboardMode>(DashboardMode.VIEW);
  const editMode = config?.widgetsPanel?.editMode;
  const isEditModeEnabled = editMode?.enabled ?? false;
  const isModeStateForced = 'isEditing' in (editMode ?? {});
  const isEditMode = !!(
    isEditModeEnabled && (isModeStateForced ? editMode?.isEditing : mode === DashboardMode.EDIT)
  );
  const isHistoryEnabled = isEditModeEnabled && (editMode?.applyChangesAsBatch?.enabled ?? true);

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

  const {
    layout: editModeLayout,
    setLayout: setEditModeLayout,
    toolbar: editModeToolbar,
  } = useEditModeToolbar({
    initialLayout: updatedLayout,
    historyCapacity: editMode?.applyChangesAsBatch?.historyLimit,
    onApply: () => {
      handleLayoutChange(editModeLayout);
      handleModeChange(DashboardMode.VIEW);
    },
    onCancel: () => handleModeChange(DashboardMode.VIEW),
  });

  const currentColumnsCount = isHistoryEnabled
    ? editModeLayout.columns.length
    : updatedLayout.columns.length;
  const isToolbarVisible = config?.toolbar?.visible !== false;
  const isFiltersPanelVisible = config?.filtersPanel?.visible !== false;
  const showFilterIconInToolbar =
    !!config?.filtersPanel?.showFilterIconInToolbar && isToolbarVisible && isFiltersPanelVisible;

  const isLayoutResponsive = config?.widgetsPanel?.responsive ?? false;

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

  const editingLayout = isHistoryEnabled ? editModeLayout : updatedLayout;
  const layoutChangeHandler = useCallback(
    (updatedLayout: WidgetsPanelLayout) => {
      if (isHistoryEnabled) {
        setEditModeLayout(updatedLayout);
      } else {
        handleLayoutChange(updatedLayout);
      }
    },
    [isHistoryEnabled, setEditModeLayout, handleLayoutChange],
  );

  const headerToolbarMenuItemSections = useMemo(() => {
    const sections: MenuItemSection[] = [];
    if (mode === DashboardMode.EDIT) {
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
  }, [mode, currentColumnsCount, layoutChangeHandler, editingLayout, t]);

  const headerToolbarComponents = useMemo(() => {
    const components: JSX.Element[] = [];

    if (isEditModeEnabled) {
      components.push(
        <EditToggle
          key="edit-toggle"
          isEditMode={isEditMode}
          isHistoryEnabled={isHistoryEnabled}
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
  ]);

  const { toolbar: headerToolbar } = useDashboardHeaderToolbar({
    menuItemSections: headerToolbarMenuItemSections,
    toolbarComponents: headerToolbarComponents,
  });

  return (
    <DashboardWrapper theme={themeSettings}>
      <ContentColumn theme={themeSettings} showRightBorder={!isFiltersPanelVisible}>
        {isToolbarVisible && (
          <DashboardHeader
            title={title}
            toolbar={() => (
              <>
                {isEditMode && isHistoryEnabled && editModeToolbar()}
                {headerToolbar()}
              </>
            )}
          />
        )}
        <ContentPanelWrapper responsive={isLayoutResponsive}>
          {isEditMode ? (
            <EditableLayout
              layout={editingLayout}
              widgets={widgets}
              onLayoutChange={layoutChangeHandler}
              config={{
                showDragHandleIcon: editMode?.showDragHandleIcon,
              }}
            />
          ) : (
            <ContentPanel
              layout={updatedLayout}
              responsive={isLayoutResponsive}
              widgets={widgets}
            />
          )}
        </ContentPanelWrapper>
      </ContentColumn>

      {isFiltersPanelVisible && (
        <HorizontalCollapse
          collapsed={isFilterPanelCollapsed}
          onCollapsedChange={handleFilterToggleClick}
          hideCollapseArrow={showFilterIconInToolbar}
        >
          <div className="csdk-w-[240px] csdk-h-[100%] csdk-flex">
            <ThemeProvider
              theme={{
                filter: {
                  panel: {
                    borderWidth: 0,
                  },
                },
              }}
            >
              <FiltersPanel
                filters={filters}
                onFiltersChange={onFiltersChange}
                defaultDataSource={defaultDataSource}
                config={config?.filtersPanel}
                dataSources={getUniqueDataSources(widgets, defaultDataSource)}
              />
            </ThemeProvider>
          </div>
        </HorizontalCollapse>
      )}
    </DashboardWrapper>
  );
};

const getUniqueDataSources = (widgets: WidgetProps[], defaultDataSource?: DataSource) => {
  const dataSourcesMap = new Map<string, DataSource>();
  // it's expected that title is unique
  // and in some of Fusion widgets dataSource.id are different for the actually same dataSources,
  // so we need to use datasource title as a key
  if (defaultDataSource) {
    dataSourcesMap.set(getDataSourceTitle(defaultDataSource), defaultDataSource);
  }
  widgets.forEach((widget) => {
    if ('dataSource' in widget && widget.dataSource) {
      const dataSourceTitle = getDataSourceTitle(widget.dataSource);
      if (!dataSourcesMap.has(dataSourceTitle)) {
        dataSourcesMap.set(dataSourceTitle, widget.dataSource);
      }
    }
  });

  return Array.from(dataSourcesMap.values());
};
