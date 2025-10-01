import { Themable } from '@/theme-provider/types';
import { FilterRelationsRules } from '@/utils/filter-relations';
import styled from '@emotion/styled';
import { Filter } from '@ethings-os/sdk-data';
import { EditPencilIcon } from '@/common/icons/edit-pencil-icon';
import { FilterRelationsTooltip } from './filter-relations-tooltip';
import { useThemeContext } from '@/theme-provider';
import { useTranslation } from 'react-i18next';

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
          <EditPencilIcon color={themeSettings.general.primaryButtonTextColor} />
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
`;

const TileContent = styled.div`
  width: 100%;
  height: 47px;
  position: relative;
  padding: 0 6px 0 12px;
  display: flex;
  align-items: center;
`;

const TileText = styled.span`
  padding-right: 8px;
`;
