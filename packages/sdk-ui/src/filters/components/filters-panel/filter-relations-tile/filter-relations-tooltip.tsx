import { useTranslation } from 'react-i18next';

import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import { Filter } from '@sisense/sdk-data';

import styled from '@/styled';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { FilterRelationsRules, getFilterRelationsDescription } from '@/utils/filter-relations';

import { generateTooltipLines } from './tooltip-utils';

export function FilterRelationsTooltip({
  relations,
  filters,
  children,
}: {
  relations: FilterRelationsRules;
  filters: Filter[];
  children: React.ReactElement;
}) {
  const { themeSettings } = useThemeContext();
  return (
    <StyledMuiTooltip
      title={<FilterRelationsTooltipContent relations={relations} filters={filters} />}
      placement="bottom"
      arrow
      theme={themeSettings}
    >
      {children}
    </StyledMuiTooltip>
  );
}

const StyledMuiTooltip = styled(({ className, ...props }: TooltipProps & Themable) => (
  <Tooltip {...props} classes={{ popper: className }} />
))`
    & .MuiTooltip-tooltip {
      background-color: #fff; // Fusion has static background color for tooltip
      color: #5b6372; // Fusion has static color for text
      line-height: 18px;
      font-size: 13px;
      padding: 15px;
      max-width: 300px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); Floating effect
    }

    & .MuiTooltip-arrow {
      color: #fff; // Matches the background color of the tooltip
    }
  `;

function FilterRelationsTooltipContent({
  relations,
  filters,
}: {
  relations: FilterRelationsRules;
  filters: Filter[];
}) {
  const { t } = useTranslation();
  const filterRelationsDescription = getFilterRelationsDescription(relations, filters);
  return (
    <div data-testid="filter-relations-tooltip">
      {generateTooltipLines(filterRelationsDescription, t).map((tooltipLine) => (
        <>
          <span>{tooltipLine}</span>
          <br />
        </>
      ))}
    </div>
  );
}
