import styled from '@emotion/styled';
import { DashboardHeaderProps } from '@/dashboard/types';
import { useThemeContext } from '@/theme-provider';
import { getDividerStyle } from '@/dashboard/utils';
import { DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH } from '@/dashboard/constants';

export const DASHBOARD_HEADER_HEIGHT = 48;

const DashboardHeaderContainer = styled.div<{
  background: string;
  color: string;
  font: string;
}>`
  height: ${DASHBOARD_HEADER_HEIGHT}px;
  font-family: ${({ font }) => font};
  background-color: ${({ background }) => background};
  color: ${({ color }) => color};
  border-bottom: ${getDividerStyle(DASHBOARD_DIVIDER_COLOR, DASHBOARD_DIVIDER_WIDTH)};
  padding: 10px 20px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
`;

const DashboardHeaderTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
`;

export const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  const { themeSettings } = useThemeContext();
  return (
    <DashboardHeaderContainer
      font={themeSettings.typography.fontFamily}
      color={themeSettings.typography.primaryTextColor}
      background={themeSettings.general.backgroundColor}
    >
      <DashboardHeaderTitle>{title}</DashboardHeaderTitle>
    </DashboardHeaderContainer>
  );
};
