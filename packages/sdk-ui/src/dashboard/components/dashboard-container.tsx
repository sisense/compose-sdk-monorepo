import { ContentPanel } from '@/dashboard/components/content-panel';
import { DashboardContainerProps } from '@/dashboard/types';
import { DashboardHeader } from '@/dashboard/components/dashboard-header';
import { useThemeContext } from '@/theme-provider';
import styled from '@emotion/styled';
import { FiltersPanel } from '@/filters';
import { getDividerStyle, getDefaultWidgetsPanelLayout } from '@/dashboard/utils';
import { HorizontalCollapse } from '@/dashboard/components/horizontal-collapse';
import { useFiltersPanelCollapsedState } from '@/dashboard/hooks/use-filters-panel-collapsed-state';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
`;

const ContentColumn = styled.div<Themable & { showRightBorder: boolean }>`
  background-color: ${({ theme }) => theme.dashboard.backgroundColor};
  flex-grow: 1;
  flex-shrink: 1;
  border-top: ${({ theme }) =>
    getDividerStyle(theme.dashboard.borderColor, theme.dashboard.borderWidth)};
  border-bottom: ${({ theme }) =>
    getDividerStyle(theme.dashboard.borderColor, theme.dashboard.borderWidth)};
  border-left: ${({ theme }) =>
    getDividerStyle(theme.dashboard.borderColor, theme.dashboard.borderWidth)};
  border-right: ${({ theme, showRightBorder }) =>
    showRightBorder ? (theme.dashboard.borderColor, theme.dashboard.borderWidth) : 'none'};
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

  const {
    layout: editModeLayout,
    setLayout: setEditModeLayout,
    toolbar: editModeToolbar,
  } = useEditModeToolbar({
    initialLayout: updatedLayout,
    onApply: () => {
      setInternalLayout(editModeLayout);
      setMode(DashboardMode.VIEW);
      onChange?.({
        type: DashboardChangeType.WIDGETS_PANEL_LAYOUT_UPDATE,
        payload: editModeLayout,
      });
    },
    onCancel: () => setMode(DashboardMode.VIEW),
  });

  const headerToolbarMenuItems = useMemo(() => {
    const items: DashboardHeaderToolbarMenuItem[] = [];

    if (config?.widgetsPanel?.editMode) {
      items.push({
        title: t('dashboard.toolbar.editLayout'),
        onClick: () => setMode(DashboardMode.EDIT),
        ariaLabel: 'edit layout button',
      });
    }

    return items;
  }, [t, config?.widgetsPanel?.editMode]);

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

  useEffect(() => {
    setMode(DashboardMode.VIEW);
  }, [widgets, filters, layoutOptions, config]);

  const isToolbarVisible = config?.toolbar?.visible !== false;
  const isFiltersPanelVisible = config?.filtersPanel?.visible !== false;
  const isLayoutResponsive = config?.widgetsPanel?.responsive ?? false;
  const isEditMode = mode === DashboardMode.EDIT;

  return (
    <DashboardWrapper theme={themeSettings}>
      <ContentColumn theme={themeSettings} showRightBorder={!isFiltersPanelVisible}>
        {isToolbarVisible && (
          <DashboardHeader title={title} toolbar={isEditMode ? editModeToolbar : headerToolbar} />
        )}
        <ContentPanelWrapper responsive={isLayoutResponsive}>
          {isEditMode ? (
            <EditableLayout
              layout={editModeLayout}
              widgets={widgets}
              onLayoutChange={(updatedLayout) => setEditModeLayout(updatedLayout)}
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
            <FiltersPanel
              filters={filters}
              onFiltersChange={onFiltersChange}
              defaultDataSource={defaultDataSource}
              config={config?.filtersPanel}
              dataSources={getUniqueDataSources(widgets, defaultDataSource)}
            />
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
