import { ContentPanel } from '@/dashboard/components/content-panel';
import { DashboardContainerProps } from '@/dashboard/types';
import { DashboardHeader } from '@/dashboard/components/dashboard-header';
import { useThemeContext } from '@/theme-provider';
import styled from '@emotion/styled';
import { FiltersPanel } from '@/filters';
import { getDividerStyle } from '@/dashboard/utils';
import { DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH } from '@/dashboard/constants';
import { HorizontalCollapse } from '@/dashboard/components/horizontal-collapse';
import { useFiltersPanelCollapsedState } from '@/dashboard/hooks/use-filters-panel-collapsed-state';
import { useCallback } from 'react';
import { DashboardChangeType } from '@/dashboard/dashboard';

const DashboardWrapper = styled.div<{
  background: string;
}>`
  max-width: 100%;
  background-color: ${({ background }) => background};
  color: ${({ color }) => color};
  display: flex;
  max-height: 100%;
`;

const ContentColumn = styled.div<{
  background: string;
}>`
  background-color: ${({ background }) => background};
  flex-grow: 1;
  flex-shrink: 1;
  border-top: ${getDividerStyle(DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH)};
  border-bottom: ${getDividerStyle(DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH)};
  border-left: ${getDividerStyle(DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH)};
  display: flex;
  flex-direction: column;
  max-height: 100%;
`;

const ContentPanelWrapper = styled.div`
  max-height: 100%;
  overflow: auto;
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
  enableFilterEditor = false,
}: DashboardContainerProps) => {
  const { themeSettings } = useThemeContext();

  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useFiltersPanelCollapsedState(
    config?.filtersPanel?.isCollapsedInitially,
    config?.filtersPanel?.persistCollapsedStateToLocalStorage,
  );
  const setIsFilterPanelCollapsedAndFireEvent = useCallback(
    (state: boolean) => {
      setIsFilterPanelCollapsed(state);
      onChange?.({ type: DashboardChangeType.UI_FILTERS_PANEL_COLLAPSE, payload: state });
    },
    [onChange, setIsFilterPanelCollapsed],
  );

  const isToolbarVisible = config?.toolbar?.isVisible !== false;
  const isFiltersPanelVisible = config?.filtersPanel?.isVisible !== false;

  return (
    <DashboardWrapper
      background={themeSettings.dashboard.backgroundColor}
      color={themeSettings.typography.primaryTextColor}
    >
      <ContentColumn background={themeSettings.dashboard.backgroundColor}>
        {isToolbarVisible && <DashboardHeader title={title} />}
        <ContentPanelWrapper>
          <ContentPanel layout={layoutOptions?.widgetsPanel} widgets={widgets} />
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
              enableFilterEditor={enableFilterEditor}
            />
          </div>
        </HorizontalCollapse>
      )}
    </DashboardWrapper>
  );
};
