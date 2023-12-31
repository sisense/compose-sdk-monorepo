import type { FunctionComponent } from 'react';
import { useThemeContext } from '../../../theme-provider';
import { SelectedMember } from './members-reducer';

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
      className="csdk-border-0 csdk-whitespace-nowrap csdk-text-ellipsis csdk-rounded-pill csdk-leading-[18px] csdk-text-pill csdk-px-2 csdk-py-[3px] csdk-tracking-[0.3px] csdk-select-none"
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
    <div
      className={
        'csdk-flex csdk-flex-wrap csdk-p-3 csdk-gap-[5px] csdk-max-h-[150px] csdk-overflow-auto'
      }
    >
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
