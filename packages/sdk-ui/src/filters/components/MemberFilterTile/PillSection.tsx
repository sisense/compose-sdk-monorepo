import type { FunctionComponent } from 'react';
import { useThemeContext } from '../../../components/ThemeProvider';
import { SelectedMember } from './membersReducer';

interface PillProps {
  name: string;
  active: boolean;
  disabled: boolean;
  onClick?: () => void;
}
const Pill = ({ name, active, disabled, onClick }: PillProps) => {
  const { themeSettings } = useThemeContext();

  const shouldShowPrimaryColor = active && !disabled;
  const backgroundColor = shouldShowPrimaryColor ? themeSettings.general.brandColor : '#cbced7';
  const textColor = shouldShowPrimaryColor
    ? themeSettings.general.primaryButtonTextColor
    : '#ffffff';

  return (
    <button
      onClick={onClick}
      className="rounded-pill text-pill px-2 py-[3px] tracking-[0.3px] select-none"
      style={{
        backgroundColor,
        color: textColor,
      }}
      disabled={disabled}
    >
      {name}
    </button>
  );
};

const IncludeAllPill = ({ disabled }: { disabled: boolean }) => (
  <Pill name="Include all" disabled={disabled} active />
);

export interface PillSectionProps {
  membersSize: number;
  selectedMembers: SelectedMember[];
  onToggleSelectedMember: (key: string) => void;
  disabled: boolean;
}

export const PillSection: FunctionComponent<PillSectionProps> = ({
  membersSize: membersSize,
  selectedMembers,
  onToggleSelectedMember,
  disabled,
}) => {
  const showIncludeAll = membersSize === selectedMembers.length || selectedMembers.length === 0;
  return (
    <div className={'flex flex-wrap p-3 gap-[5px] max-h-[150px] overflow-auto'}>
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
