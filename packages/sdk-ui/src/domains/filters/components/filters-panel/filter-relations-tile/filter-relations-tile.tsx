import { useTranslation } from 'react-i18next';

import { Filter } from '@sisense/sdk-data';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';
import { FilterRelationsRules } from '@/shared/utils/filter-relations';

import { FILTER_TILE_MIN_WIDTH } from '../constants.js';
import { FilterRelationsTooltip } from './filter-relations-tooltip.js';

/**
 * Filter relations tile component.
 */
export function FilterRelationsTile({
  relations,
  filters,
}: {
  relations: FilterRelationsRules;
  filters: Filter[];
}) {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();
  return (
    <FilterRelationsTooltip relations={relations} filters={filters}>
      <TileContainer theme={themeSettings}>
        <TileContent>
          <TileText>{t('filterRelations.andOrFormulaApplied')}</TileText>
        </TileContent>
      </TileContainer>
    </FilterRelationsTooltip>
  );
}

const TileContainer = styled.div<Themable>`
  background-color: ${({ theme }) => theme.general.brandColor};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: 14px;
  color: ${({ theme }) => theme.general.primaryButtonTextColor};
  &:hover {
    background-color: ${({ theme }) => theme.general.primaryButtonHoverColor};
    cursor: pointer;
  }
  border-radius: 6px;
  margin-top: 6px;
  min-width: ${FILTER_TILE_MIN_WIDTH}px;
  width: min-content;
`;

const TileContent = styled.div`
  height: 47px;
  position: relative;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TileText = styled.span`
  padding: 4px;
`;
