import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import Button from '@mui/material/Button';

import { PlusIcon } from '@/common/icons/plus-icon';
import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';

const PanelHeader = styled.div<Themable>`
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.filter.panel.titleColor};
  margin: 0 9px;
  height: 48px;
  border-bottom: 1px solid #dadada;
  box-sizing: border-box;
`;
const PanelTitle = styled.div`
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 8px;
`;

const RoundButton = styled(Button)<Themable>`
  border-radius: 50%;
  min-width: 0;
  padding: 0;
  width: 28px;
  height: 28px;
  color: ${({ theme }) => theme.filter.panel.titleColor};

  svg path {
    fill: ${({ theme }) => theme.filter.panel.titleColor};
  }
`;

type FiltersPanelHeaderProps = {
  onAddFilterButtonClick: () => void;
  shouldShowAddFilterButton?: boolean;
};

export const FiltersPanelHeader = ({
  onAddFilterButtonClick,
  shouldShowAddFilterButton,
}: FiltersPanelHeaderProps) => {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  return (
    <PanelHeader theme={themeSettings} data-testid="filters-panel-header">
      <PanelTitle>{t('filters')}</PanelTitle>
      {shouldShowAddFilterButton && <AddFilterButton onClick={onAddFilterButtonClick} />}
    </PanelHeader>
  );
};

const AddFilterButton = ({ onClick }: { onClick: () => void }) => {
  const { themeSettings } = useThemeContext();
  return (
    <RoundButton onClick={onClick} data-testid="add-filter-button" theme={themeSettings}>
      <PlusIcon />
    </RoundButton>
  );
};
