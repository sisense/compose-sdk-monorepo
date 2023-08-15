import type { FunctionComponent, ReactNode } from 'react';
import { useState } from 'react';

import { SisenseSwitchButton } from './common';
import { ArrowDownIcon } from './icons';
import { useThemeContext } from '../../components/ThemeProvider';
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
      className={'w-[216px] border border-solid border-[#dadada] text-text-content'}
      style={{
        backgroundColor: disabled ? disabledBgColor : bgColor,
      }}
    >
      <header className={'flex items-center border-b border-solid border-[#dadada]'}>
        <ArrowDownIcon
          aria-label="arrow-down"
          width="16"
          height="16"
          className={`cursor-pointer ${collapsed ? '' : '-rotate-90'}`}
          onClick={() => setCollapsed((value) => !value)}
        />
        <span className={'pl-2 text-[13px]'}>{title}</span>
      </header>

      <main className={'border-b border-solid border-[#dadada]'}>
        {renderContent(collapsed, disabled)}
      </main>

      <footer className={'flex justify-end items-center min-h-[26px]'}>
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
