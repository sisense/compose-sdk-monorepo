import styled from '@emotion/styled';
import { DashboardHeaderProps } from '@/dashboard/types';
import { useThemeContext } from '@/theme-provider';
import { getDividerStyle } from '@/dashboard/utils';
import { Themable } from '@/theme-provider/types';

export const DASHBOARD_HEADER_HEIGHT = 48;

const DashboardHeaderContainer = styled.div<Themable>`
  height: ${DASHBOARD_HEADER_HEIGHT}px;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  background-color: ${({ theme }) => theme.general.backgroundColor};
  color: ${({ theme }) => theme.typography.primaryTextColor};
  border-bottom: ${({ theme }) =>
    getDividerStyle(theme.dashboard.borderColor, theme.dashboard.borderWidth)};
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
      <div>{toolbar?.()}</div>
    </DashboardHeaderContainer>
  );
};
