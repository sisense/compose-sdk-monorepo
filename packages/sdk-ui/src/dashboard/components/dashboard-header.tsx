import { DashboardHeaderProps } from '@/dashboard/types';
import { getDividerStyle } from '@/dashboard/utils';
import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';

export const DASHBOARD_HEADER_HEIGHT = 48;

const DashboardHeaderContainer = styled.div<Themable>`
  height: ${DASHBOARD_HEADER_HEIGHT}px;
  min-height: ${DASHBOARD_HEADER_HEIGHT}px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background-color: ${({ theme }) => theme.dashboard.toolbar.backgroundColor};
  color: ${({ theme }) => theme.dashboard.toolbar.primaryTextColor};
  border-bottom: ${({ theme }) =>
    getDividerStyle(
      theme.dashboard.toolbar.dividerLineColor,
      theme.dashboard.toolbar.dividerLineWidth,
    )};
  padding: 10px 20px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  justify-content: space-between;
`;

const DashboardHeaderTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
`;

export const DashboardHeader = ({ title, toolbar }: DashboardHeaderProps) => {
  const { themeSettings } = useThemeContext();
  return (
    <DashboardHeaderContainer theme={themeSettings}>
      <DashboardHeaderTitle>{title}</DashboardHeaderTitle>
      <div data-testid="dashboard-header-toolbar" className="csdk-flex">
        {toolbar?.()}
      </div>
    </DashboardHeaderContainer>
  );
};
