import type { FunctionComponent, ReactNode } from 'react';
import { useState } from 'react';

import { SisenseSwitchButton } from './common';
import { ArrowDownIcon } from './icons';
import { useThemeContext } from '../../components/theme-provider';
import { getSlightlyDifferentColor } from '../../utils/color';

interface Props {
  title: string;
  renderContent: (collapsed: boolean, tileDisabled: boolean) => ReactNode;
  disabled: boolean;
  onToggleDisabled: () => void;
}

/**
 * Generic component that owns common functionality of a filter "tile" like
 * collapsible content and an enable/disable toggle. This is intended to match
 * the style of filter tiles in the right sidebar on a Sisense dashboard.
 */
export const FilterTile: FunctionComponent<Props> = ({
  title,
  renderContent,
  disabled,
  onToggleDisabled,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  const { themeSettings } = useThemeContext();

  const { backgroundColor: bgColor } = themeSettings.general;
  const disabledBgColor = getSlightlyDifferentColor(bgColor, 0.1);

  return (
    <div
      className={
        'csdk-w-[216px] csdk-border csdk-border-solid csdk-border-[#dadada] csdk-text-text-content csdk-self-start'
      }
      style={{
        backgroundColor: disabled ? disabledBgColor : bgColor,
      }}
    >
      <header
        className={
          'csdk-flex csdk-items-center csdk-border-b csdk-border-solid csdk-border-[#dadada]'
        }
      >
        <ArrowDownIcon
          aria-label="arrow-down"
          width="16"
          height="16"
          className={`csdk-cursor-pointer ${collapsed ? '' : '-csdk-rotate-90'}`}
          onClick={() => setCollapsed((value) => !value)}
        />
        <span className={'csdk-pl-2 csdk-text-[13px]'}>{title}</span>
      </header>

      <main className={'csdk-border-b csdk-border-solid csdk-border-[#dadada]'}>
        {renderContent(collapsed, disabled)}
      </main>

      <footer className={'csdk-flex csdk-justify-end csdk-items-center csdk-min-h-[26px]'}>
        <SisenseSwitchButton
          checked={!disabled}
          size="small"
          onChange={() => onToggleDisabled()}
          inputProps={{ role: 'switch', name: 'tile-switch' }}
        />
      </footer>
    </div>
  );
};
