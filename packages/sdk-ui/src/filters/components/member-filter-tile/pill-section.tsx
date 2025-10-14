import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { FilterContentDisplay } from '@/filters/components/common';

import { useThemeContext } from '../../../theme-provider';
import { Member, SelectedMember } from './members-reducer';

const StyledPillButton = styled.button<{
  backgroundColor: string;
  textColor: string;
}>`
  font-family: inherit;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
  border: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
  line-height: 18px;
  font-size: 13px;
  padding: 3px 8px;
  border-radius: 4px;
  // minus half of space between pills to fit 2 pills per row
  max-width: calc(50% - 2.5px);
  user-select: none;
  cursor: pointer;
`;

const PillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`;

interface PillProps {
  name: string;
  active: boolean;
  excludeMembers: boolean;
  disabled: boolean;
  onClick?: () => void;
}
const Pill = ({ name, active, excludeMembers, disabled, onClick }: PillProps) => {
  const { themeSettings } = useThemeContext();

  const shouldShowPrimaryColor = active && !disabled;
  const backgroundColor = shouldShowPrimaryColor
    ? excludeMembers
      ? '#fc7570'
      : themeSettings.general.brandColor
    : '#cbced7';
  const textColor = shouldShowPrimaryColor
    ? excludeMembers
      ? '#ffffff'
      : themeSettings.general.primaryButtonTextColor
    : '#ffffff';

  return (
    <StyledPillButton backgroundColor={backgroundColor} textColor={textColor} onClick={onClick}>
      {name}
    </StyledPillButton>
  );
};

const IncludeAllPill = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation();

  return <Pill name={t('includeAll')} disabled={disabled} excludeMembers={false} active />;
};

export interface PillSectionProps {
  members: Member[];
  selectedMembers: SelectedMember[];
  onToggleSelectedMember: (key: string) => void;
  excludeMembers: boolean;
  disabled: boolean;
}

export const PillSection: FunctionComponent<PillSectionProps> = ({
  members,
  selectedMembers,
  onToggleSelectedMember,
  excludeMembers,
  disabled,
}) => {
  const showIncludeAll =
    (selectedMembers.length === 0 || selectedMembers.length === members.length) &&
    selectedMembers.every((m) => !m.inactive);
  return (
    <FilterContentDisplay>
      <PillsContainer>
        {showIncludeAll && <IncludeAllPill disabled={disabled} />}
        {!showIncludeAll &&
          selectedMembers.map((m) => {
            return (
              <Pill
                key={m.key}
                name={m.title}
                active={!m.inactive}
                onClick={() => onToggleSelectedMember(m.key)}
                excludeMembers={excludeMembers}
                disabled={disabled}
              />
            );
          })}
      </PillsContainer>
    </FilterContentDisplay>
  );
};
