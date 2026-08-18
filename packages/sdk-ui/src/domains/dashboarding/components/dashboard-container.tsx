import { useMemo } from 'react';

import styled from '@emotion/styled';
import { DataSource } from '@sisense/sdk-data';

import { ContentPanel } from '@/domains/dashboarding/components/content-panel';
import { DashboardHeader } from '@/domains/dashboarding/components/dashboard-header/dashboard-header';
import { DashboardHeaderTargets } from '@/domains/dashboarding/components/dashboard-header/dashboard-header-targets';
import { createDashboardTitleItem } from '@/domains/dashboarding/components/dashboard-header/dashboard-header-title';
import { EditableLayout } from '@/domains/dashboarding/components/editable-layout/editable-layout';
import { HorizontalCollapse } from '@/domains/dashboarding/components/horizontal-collapse';
import { DashboardContainerProps } from '@/domains/dashboarding/types';
import {
  getDefaultWidgetsPanelLayout,
  getDividerStyle,
  isDashboardHeaderVisible,
} from '@/domains/dashboarding/utils';
import { FiltersPanel } from '@/domains/filters';
import { createHeaderSpacerItem } from '@/domains/shared/header';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { ThemeProvider, useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import { getDataSourceTitle } from '@/shared/utils/data-sources-utils';

const DashboardWrapper = styled.div<Themable>`
  /* Fill the container (and shrink within a flex parent) instead of hugging content, so a long
     header title ellipsizes rather than widening the dashboard. */
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
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
  /* Allow the column to shrink below its content's intrinsic width so the header can clip. */
  min-width: 0;

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
  headerItems,
  headerConfig,
  title,
  layoutOptions,
  config,
  widgets,
  filters,
  onFiltersChange,
  defaultDataSource,
  filterPanelCollapsed,
  onFilterPanelCollapsedChange,
  filterWidgetLinkedIds,
}: DashboardContainerProps) => {
  const { themeSettings } = useThemeContext();

  const isLayoutResponsive = config?.widgetsPanel?.responsive ?? false;
  const isHeaderVisible = isDashboardHeaderVisible(config);
  const isFiltersPanelVisible = config?.filtersPanel?.visible !== false;
  const hideFiltersPanelCollapseArrow =
    isHeaderVisible &&
    isFiltersPanelVisible &&
    (config?.filtersPanel?.showFilterIconInToolbar ?? false);

  const layout = useMemo(() => {
    return layoutOptions?.widgetsPanel ?? getDefaultWidgetsPanelLayout(widgets);
  }, [layoutOptions, widgets]);

  // Build the unified header items list: the title leads, followed by the flexible center spacer,
  // then the action items. The title and spacer are built-in items like any other, so custom items
  // can be placed before the title (`first` / `before: Title`), around the spacer, or `auto`
  // (after the spacer).
  const items = useMemo(
    () => [
      createDashboardTitleItem(title),
      createHeaderSpacerItem(DashboardHeaderTargets.Spacer),
      ...(headerItems ?? []),
    ],
    [title, headerItems],
  );

  return (
    <DashboardWrapper theme={themeSettings}>
      <ContentColumn theme={themeSettings} showRightBorder={!isFiltersPanelVisible}>
        {isHeaderVisible && <DashboardHeader items={items} config={headerConfig} />}
        <ContentPanelWrapper responsive={isLayoutResponsive}>
          {editMode ? (
            <EditableLayout
              layout={layout}
              widgets={widgets}
              onLayoutChange={onLayoutChange}
              config={{
                showDragHandleIcon: config?.widgetsPanel?.editMode?.showDragHandleIcon,
                deleteWidgetEnabled: config?.widgetsPanel?.editMode?.deleteWidget?.enabled,
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
          arrowTestId="csdk-filters-panel-collapse-toggle"
          contentTestId="csdk-filters-panel-collapse-content"
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
                filterWidgetLinkedIds={filterWidgetLinkedIds}
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
