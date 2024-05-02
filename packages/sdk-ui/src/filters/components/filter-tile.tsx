import type { FunctionComponent, ReactNode } from 'react';
import { useState } from 'react';

import { SisenseSwitchButton, TriangleIndicator } from './common';
import { ArrowDownIcon } from './icons';
import { useThemeContext } from '../../theme-provider';
import { getSlightlyDifferentColor } from '../../utils/color';
import { FilterVariant, isVertical } from './common/filter-utils';
import styled from '@emotion/styled';

interface Props {
  title: string;
  renderContent: (collapsed: boolean, tileDisabled: boolean) => ReactNode;
  arrangement?: FilterVariant;
  disabled?: boolean;
  isDependent?: boolean;
  onToggleDisabled?: () => void;
}

const GroupHoverWrapper = styled('div')({
  '.MuiSwitch-root': {
    opacity: 0.55,
    transition: 'all .3s ease',
  },
  '&:hover': {
    '.MuiSwitch-root': {
      opacity: 1,
    },
  },
});

/**
 * Generic component that owns common functionality of a filter "tile" like
 * collapsible content and an enable/disable toggle. This is intended to match
 * the style of filter tiles in the right sidebar on a Sisense dashboard.
 */
export const FilterTile: FunctionComponent<Props> = ({
  title,
  renderContent,
  arrangement = 'vertical',
  disabled,
  onToggleDisabled,
  isDependent,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  const { themeSettings } = useThemeContext();

  const { backgroundColor: bgColor } = themeSettings.general;
  const { primaryTextColor: textColor } = themeSettings.typography;
  const disabledBgColor = getSlightlyDifferentColor(bgColor, 0.1);

  return (
    <GroupHoverWrapper>
      <div
        className={`${isVertical(arrangement) ? 'csdk-min-w-[216px]' : ''} ${
          isDependent ? '' : 'csdk-p-px'
        } csdk-w-min csdk-border csdk-border-solid csdk-border-[#dadada] csdk-text-text-content csdk-self-start`}
        style={{
          backgroundColor: disabled ? disabledBgColor : bgColor,
        }}
      >
        {isVertical(arrangement) && (
          <>
            {isDependent && <TriangleIndicator />}
            <header
              className={
                'csdk-flex csdk-items-center csdk-border-0 csdk-border-b csdk-border-solid csdk-border-b-[#dadada]'
              }
              style={{ color: textColor }}
            >
              <ArrowDownIcon
                aria-label="arrow-down"
                width="16"
                height="16"
                fill={`${textColor ?? '#5B6372'}`}
                className={`csdk-transition csdk-ml-[4px] csdk-cursor-pointer ${
                  collapsed ? '-csdk-rotate-90' : ''
                }`}
                onClick={() => setCollapsed((value) => !value)}
              />
              <span
                className={
                  'csdk-text-[13px] csdk-mt-[6px] csdk-mb-[4px] csdk-ml-[7px] csdk-leading-[16px]'
                }
                style={{ color: textColor }}
              >
                {title}
              </span>
            </header>
          </>
        )}

        <main style={{ color: textColor }}>{renderContent(collapsed, disabled ?? false)}</main>

        {isVertical(arrangement) && (
          <footer
            className={
              'csdk-flex csdk-justify-end csdk-items-center csdk-min-h-[26px] csdk-border-0 csdk-border-t csdk-border-solid csdk-border-t-[#dadada]'
            }
          >
            <SisenseSwitchButton
              checked={!disabled}
              size="small"
              onChange={() => onToggleDisabled?.()}
              inputProps={{ role: 'switch', name: 'tile-switch' }}
            />
          </footer>
        )}
      </div>
    </GroupHoverWrapper>
  );
};
