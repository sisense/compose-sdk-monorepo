import { ContentPanel } from '@/dashboard/components/content-panel';
import { DashboardContainerProps } from '@/dashboard/types';
import { DashboardHeader } from '@/dashboard/components/dashboard-header';
import { useThemeContext } from '@/theme-provider';
import styled from '@emotion/styled';
import { FiltersPanel } from '@/filters';
import { getDividerStyle } from '@/dashboard/utils';
import { DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH } from '@/dashboard/constants';

const DashboardWrapper = styled.div<{
  background: string;
}>`
  max-width: 100%;
  background-color: ${({ background }) => background};
  color: ${({ color }) => color};
  display: flex;
`;

const ContentColumn = styled.div<{
  background: string;
}>`
  background-color: ${({ background }) => background};
  flex: 1;
  border-top: ${getDividerStyle(DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH)};
  border-bottom: ${getDividerStyle(DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH)};
  border-left: ${getDividerStyle(DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH)};
`;

export const DashboardContainer = ({
  title,
  layoutOptions,
  config,
  widgets,
  filters,
  onFiltersChange,
  defaultDataSource,
}: DashboardContainerProps) => {
  const { themeSettings } = useThemeContext();

  const isToolbarVisible = config?.toolbar?.isVisible !== false;
  const isFiltersPanelVisible = config?.filtersPanel?.isVisible !== false;

  return (
    <DashboardWrapper
      background={themeSettings.dashboard.backgroundColor}
      color={themeSettings.typography.primaryTextColor}
    >
      <ContentColumn background={themeSettings.dashboard.backgroundColor}>
        {isToolbarVisible && <DashboardHeader title={title} />}
        <ContentPanel layout={layoutOptions?.widgetsPanel} widgets={widgets} />
      </ContentColumn>

      {isFiltersPanelVisible && (
        <div className="csdk-w-[240px] csdk-flex">
          <FiltersPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            defaultDataSource={defaultDataSource}
          />
        </div>
      )}
    </DashboardWrapper>
  );
};
