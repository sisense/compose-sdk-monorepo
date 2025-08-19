import { ContentPanel } from '@/dashboard/components/content-panel';
import { DashboardContainerProps, WidgetsPanelLayout } from '@/dashboard/types';
import { DashboardHeader } from '@/dashboard/components/dashboard-header';
import { ThemeProvider, useThemeContext } from '@/theme-provider';
import styled from '@emotion/styled';
import { FiltersPanel } from '@/filters';
import { getDividerStyle, getDefaultWidgetsPanelLayout } from '@/dashboard/utils';
import { HorizontalCollapse } from '@/dashboard/components/horizontal-collapse';
import { useFiltersPanelCollapsedState } from '@/dashboard/hooks/use-filters-panel-collapsed-state';
import { useCallback, useMemo, useState } from 'react';
import { DashboardChangeType } from '@/dashboard/dashboard';
import { WidgetProps } from '@/props';
import { DataSource } from '@sisense/sdk-data';
import { getDataSourceTitle } from '@/utils/data-sources-utils';
import { Themable } from '@/theme-provider/types';
import { EditableLayout } from '@/dashboard/components/editable-layout/editable-layout';
import { useSyncedState } from '@/common/hooks/use-synced-state';
import { useEditModeToolbar } from '../hooks/use-edit-mode-toolbar';
import {
  DashboardHeaderToolbarMenuItem,
  useDashboardHeaderToolbar,
} from '../hooks/use-dashboard-header-toolbar';
import { useTranslation } from 'react-i18next';
import { findDeletedWidgetsFromLayout } from './editable-layout/helpers';

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
        type: DashboardChangeType.WIDGETS_PANEL_LAYOUT_IS_EDITING_CHANGE,
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
        type: DashboardChangeType.WIDGETS_PANEL_LAYOUT_UPDATE,
        payload: changedLayout,
      });
      if (deletedWidgets.length > 0) {
        onChange?.({
          type: DashboardChangeType.WIDGETS_DELETE,
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

  const headerToolbarMenuItems = useMemo(() => {
    const items: DashboardHeaderToolbarMenuItem[] = [];

    if (isEditModeEnabled) {
      if (isHistoryEnabled || !isEditMode) {
        items.push({
          title: t('dashboard.toolbar.editLayout'),
          onClick: () => handleModeChange(DashboardMode.EDIT),
          ariaLabel: 'edit layout button',
        });
      } else {
        items.push({
          title: t('dashboard.toolbar.viewMode'),
          onClick: () => handleModeChange(DashboardMode.VIEW),
          ariaLabel: 'view layout button',
        });
      }
    }

    return items;
  }, [t, isEditModeEnabled, isEditMode, isHistoryEnabled, handleModeChange]);

  const { toolbar: headerToolbar } = useDashboardHeaderToolbar({
    menuItems: headerToolbarMenuItems,
  });

  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useFiltersPanelCollapsedState(
    config?.filtersPanel?.collapsedInitially,
    config?.filtersPanel?.persistCollapsedStateToLocalStorage,
  );
  const setIsFilterPanelCollapsedAndFireEvent = useCallback(
    (state: boolean) => {
      setIsFilterPanelCollapsed(state);
      onChange?.({ type: DashboardChangeType.UI_FILTERS_PANEL_COLLAPSE, payload: state });
    },
    [onChange, setIsFilterPanelCollapsed],
  );

  const isToolbarVisible = config?.toolbar?.visible !== false;
  const isFiltersPanelVisible = config?.filtersPanel?.visible !== false;
  const isLayoutResponsive = config?.widgetsPanel?.responsive ?? false;

  return (
    <DashboardWrapper theme={themeSettings}>
      <ContentColumn theme={themeSettings} showRightBorder={!isFiltersPanelVisible}>
        {isToolbarVisible && (
          <DashboardHeader
            title={title}
            toolbar={isEditMode && isHistoryEnabled ? editModeToolbar : headerToolbar}
          />
        )}
        <ContentPanelWrapper responsive={isLayoutResponsive}>
          {isEditMode ? (
            <EditableLayout
              layout={isHistoryEnabled ? editModeLayout : updatedLayout}
              widgets={widgets}
              onLayoutChange={(updatedLayout) =>
                isHistoryEnabled
                  ? setEditModeLayout(updatedLayout)
                  : handleLayoutChange(updatedLayout)
              }
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
          onCollapsedChange={setIsFilterPanelCollapsedAndFireEvent}
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
