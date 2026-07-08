import styled from '@emotion/styled';

import { DashboardHeaderTargets } from '@/domains/dashboarding/components/dashboard-header/dashboard-header-targets';
import { HeaderItem } from '@/domains/shared/header';

const StyledDashboardHeaderTitle = styled.div`
  /* min-width:0 lets the title shrink within its flex cell so a long title ellipsizes instead of
     widening the header (and the dashboard). */
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * Props for {@link DashboardHeaderTitle}.
 */
export interface DashboardHeaderTitleProps {
  /** The dashboard title text. */
  title: string;
}

/**
 * The dashboard title, rendered as the content of the built-in title header item.
 */
export const DashboardHeaderTitle = ({ title }: DashboardHeaderTitleProps) => (
  <StyledDashboardHeaderTitle data-testid="dashboard-header-title">
    {title}
  </StyledDashboardHeaderTitle>
);

/**
 * Builds the built-in title header item.
 *
 * The title can be targeted by `before`/`after`. It uses the internal `fill: 'truncate'` so it
 * takes its natural content width on the leading side and is the only item that shrinks/ellipsizes
 * under pressure (action buttons keep their size); the center spacer absorbs the free space.
 */
export const createDashboardTitleItem = (title: string): HeaderItem => ({
  id: DashboardHeaderTargets.Title,
  fill: 'truncate',
  component: () => <DashboardHeaderTitle title={title} />,
});
