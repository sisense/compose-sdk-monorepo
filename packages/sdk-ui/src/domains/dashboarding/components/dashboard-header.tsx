import styled from '@emotion/styled';

import { DashboardHeaderTargets } from '@/domains/dashboarding/components/dashboard-header-targets';
import { DashboardHeaderProps } from '@/domains/dashboarding/types';
import { getDividerStyle } from '@/domains/dashboarding/utils';
import { HeaderItemsRenderer, useResolvedHeaderItems } from '@/domains/shared/header';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';

export const DASHBOARD_HEADER_HEIGHT = 48;

/** Default size (px) for dashboard header items that don't specify their own size. */
export const DASHBOARD_HEADER_ITEM_SIZE = 28;

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
  /* Fill the available width but contribute 0 to the column's intrinsic (max-content) width, so a
     long title ellipsizes instead of widening the header - even inside a shrink-to-fit parent
     (e.g. an inline-block or a non-stretch flex column). width:0 zeroes the contribution while
     min-width:100% makes the header fill its container; overflow:hidden clips the result. */
  width: 0;
  min-width: 100%;
  overflow: hidden;
`;

/**
 * Dashboard header.
 *
 * Pure renderer: it receives the full list of built-in header items (title and center spacer
 * included), resolves them against the user {@link DashboardHeaderConfig} (ordering then
 * `onBeforeRender`), and renders the result. Auto-positioned items land after the center spacer.
 */
export const DashboardHeader = ({ items = [], config }: DashboardHeaderProps) => {
  const { themeSettings } = useThemeContext();

  const resolvedItems = useResolvedHeaderItems(items, config, {
    autoAnchorId: DashboardHeaderTargets.Spacer,
  });

  return (
    <DashboardHeaderContainer theme={themeSettings}>
      <HeaderItemsRenderer items={resolvedItems} defaultSize={DASHBOARD_HEADER_ITEM_SIZE} />
    </DashboardHeaderContainer>
  );
};
