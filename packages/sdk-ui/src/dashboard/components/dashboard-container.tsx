import { ContentPanel } from '@/dashboard/components/content-panel';
import { DashboardLayoutProps } from '@/dashboard/types';
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
  layout,
  widgets,
  filters,
  onFiltersChange,
}: DashboardLayoutProps) => {
  const { themeSettings } = useThemeContext();
  return (
    <DashboardWrapper
      background={themeSettings.general.backgroundColor}
      color={themeSettings.typography.primaryTextColor}
    >
      <ContentColumn background={themeSettings.chart.backgroundColor}>
        <DashboardHeader title={title} />
        <ContentPanel layout={layout} widgets={widgets} />
      </ContentColumn>
      <FiltersPanel filters={filters} onFiltersChange={onFiltersChange} />
    </DashboardWrapper>
  );
};
