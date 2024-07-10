import styled from '@emotion/styled';
import type { FunctionComponent } from 'react';
import { useThemeContext } from '../../../theme-provider';
import { SelectedMember } from './members-reducer';

const StyledPillButton = styled.button<{
  backgroundColor: string;
  textColor: string;
  active: boolean;
  disabled: boolean;
}>`
  font-family: inherit;
  background-color: ${({ backgroundColor, active, disabled }) =>
    active && !disabled ? backgroundColor : '#cbced7'};
  color: ${({ textColor, active, disabled }) => (active && !disabled ? textColor : '#ffffff')};
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

interface PillProps {
  name: string;
  active: boolean;
  disabled: boolean;
  onClick?: () => void;
}
const Pill = ({ name, active, disabled, onClick }: PillProps) => {
  const { themeSettings } = useThemeContext();

  return (
    <StyledPillButton
      backgroundColor={themeSettings.general.brandColor}
      textColor={themeSettings.general.primaryButtonTextColor}
      active={active}
      onClick={onClick}
      disabled={disabled}
    >
      {name}
    </StyledPillButton>
  );
};

const IncludeAllPill = ({ disabled }: { disabled: boolean }) => (
  <Pill name="Include all" disabled={disabled} active />
);

export interface PillSectionProps {
  selectedMembers: SelectedMember[];
  onToggleSelectedMember: (key: string) => void;
  disabled: boolean;
}

export const PillSection: FunctionComponent<PillSectionProps> = ({
  selectedMembers,
  onToggleSelectedMember,
  disabled,
}) => {
  const showIncludeAll = selectedMembers.length === 0;
  return (
    <div className={'csdk-flex csdk-flex-wrap csdk-p-3 csdk-gap-[5px]'}>
      {showIncludeAll && <IncludeAllPill disabled={disabled} />}
      {!showIncludeAll &&
        selectedMembers.map((m) => {
          return (
            <Pill
              key={m.key}
              name={m.title}
              active={!m.inactive}
              onClick={() => onToggleSelectedMember(m.key)}
              disabled={disabled}
            />
          );
        })}
    </div>
  );
};
