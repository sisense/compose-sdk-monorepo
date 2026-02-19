import { useMemo } from 'react';

import { DataSource } from '@sisense/sdk-data';

import { ContentPanel } from '@/domains/dashboarding/components/content-panel';
import { DashboardHeader } from '@/domains/dashboarding/components/dashboard-header';
import { EditableLayout } from '@/domains/dashboarding/components/editable-layout/editable-layout';
import { HorizontalCollapse } from '@/domains/dashboarding/components/horizontal-collapse';
import { DashboardContainerProps } from '@/domains/dashboarding/types';
import { getDefaultWidgetsPanelLayout, getDividerStyle } from '@/domains/dashboarding/utils';
import { FiltersPanel } from '@/domains/filters';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { ThemeProvider, useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';
import { getDataSourceTitle } from '@/shared/utils/data-sources-utils';

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
  editMode,
  onLayoutChange,
  renderToolbar,
  title,
  layoutOptions,
  config,
  widgets,
  filters,
  onFiltersChange,
  defaultDataSource,
  filterPanelCollapsed,
  onFilterPanelCollapsedChange,
}: DashboardContainerProps) => {
  const { themeSettings } = useThemeContext();

  const isLayoutResponsive = config?.widgetsPanel?.responsive ?? false;
  const isToolbarVisible = config?.toolbar?.visible !== false;
  const isFiltersPanelVisible = config?.filtersPanel?.visible !== false;
  const hideFiltersPanelCollapseArrow =
    isToolbarVisible &&
    isFiltersPanelVisible &&
    (config?.filtersPanel?.showFilterIconInToolbar ?? false);

  const layout = useMemo(() => {
    return layoutOptions?.widgetsPanel ?? getDefaultWidgetsPanelLayout(widgets);
  }, [layoutOptions, widgets]);

  return (
    <DashboardWrapper theme={themeSettings}>
      <ContentColumn theme={themeSettings} showRightBorder={!isFiltersPanelVisible}>
        {isToolbarVisible && <DashboardHeader title={title} toolbar={renderToolbar} />}
        <ContentPanelWrapper responsive={isLayoutResponsive}>
          {editMode ? (
            <EditableLayout
              layout={layout}
              widgets={widgets}
              onLayoutChange={onLayoutChange}
              config={{
                showDragHandleIcon: config?.widgetsPanel?.editMode?.showDragHandleIcon,
              }}
            />
          ) : (
            <ContentPanel layout={layout} responsive={isLayoutResponsive} widgets={widgets} />
          )}
        </ContentPanelWrapper>
      </ContentColumn>

      {isFiltersPanelVisible && (
        <HorizontalCollapse
          collapsed={filterPanelCollapsed}
          onCollapsedChange={onFilterPanelCollapsedChange}
          hideCollapseArrow={hideFiltersPanelCollapseArrow}
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
