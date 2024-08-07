import type { FunctionComponent, ReactNode } from 'react';
import { useState } from 'react';

import { SisenseSwitchButton, TriangleIndicator } from './common';
import { ArrowDownIcon, LockIcon } from './icons';
import { useThemeContext } from '../../theme-provider';
import { getSlightlyDifferentColor } from '../../utils/color';
import { FilterVariant, isVertical } from './common/filter-utils';
import styled from '@emotion/styled';
import merge from 'ts-deepmerge';
import { DeepRequired } from 'ts-essentials';
import { BackgroundFilterIcon } from '@/filters/components/icons/background-filter-icon';
import { css } from '@emotion/react';

const BORDER_STYLE = '1px solid #dadada';
const FILTER_TILE_MIN_WIDTH = 215;

const Container = styled.div<{
  shouldShowBorder: boolean;
}>`
  width: min-content;
  max-width: 100%;
  align-self: flex-start;
  box-sizing: border-box;

  ${({ shouldShowBorder }) =>
    shouldShowBorder &&
    css`
      border: ${BORDER_STYLE};
    `}
`;

const Header = styled.header<{
  shouldShowBorder: boolean;
}>`
  display: flex;
  align-items: center;

  ${({ shouldShowBorder }) =>
    shouldShowBorder &&
    css`
      border-bottom: ${BORDER_STYLE};
    `}
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 26px;

  border-top: ${BORDER_STYLE};
`;

/**
 * Design options for the filter tile component.
 *
 * @internal
 */
export interface FilterTileDesignOptions {
  header?: {
    shouldBeShown?: boolean;
    isCollapsible?: boolean;
    hasBorder?: boolean;
    hasBackgroundFilterIcon?: boolean;
  };
  border?: {
    shouldBeShown?: boolean;
  };
  footer?: {
    shouldBeShown?: boolean;
  };
}

export type CompleteFilterTileDesignOptions = DeepRequired<FilterTileDesignOptions>;

interface Props {
  title?: string;
  renderContent: (collapsed: boolean, tileDisabled: boolean) => ReactNode;
  arrangement?: FilterVariant;
  disabled?: boolean;
  isDependent?: boolean;
  design?: FilterTileDesignOptions;
  onToggleDisabled?: () => void;
  locked?: boolean;
}

const defaultDesign: CompleteFilterTileDesignOptions = {
  header: {
    shouldBeShown: true,
    hasBorder: true,
    isCollapsible: true,
    hasBackgroundFilterIcon: false,
  },
  border: {
    shouldBeShown: true,
  },
  footer: {
    shouldBeShown: true,
  },
};

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
export const FilterTile: FunctionComponent<Props> = (props) => {
  const {
    title,
    renderContent,
    arrangement = 'vertical',
    disabled,
    onToggleDisabled,
    isDependent,
    locked = false,
  } = props;
  const design = merge.withOptions(
    { mergeArrays: false },
    defaultDesign,
    props.design ?? {},
  ) as CompleteFilterTileDesignOptions;
  const [collapsed, setCollapsed] = useState(true);

  const { themeSettings } = useThemeContext();

  const { backgroundColor: bgColor } = themeSettings.general;
  const { primaryTextColor: textColor } = themeSettings.typography;
  const disabledBgColor = getSlightlyDifferentColor(bgColor, 0.1);
  const minWidth = isDependent ? FILTER_TILE_MIN_WIDTH - 2 : FILTER_TILE_MIN_WIDTH;

  return (
    <GroupHoverWrapper>
      <Container
        shouldShowBorder={design.border?.shouldBeShown}
        style={{
          minWidth: isVertical(arrangement) ? minWidth : 'auto',
          backgroundColor: disabled ? disabledBgColor : bgColor,
        }}
      >
        {isVertical(arrangement) && design.header.shouldBeShown && (
          <>
            {isDependent && <TriangleIndicator />}
            <Header shouldShowBorder={design.header.hasBorder} style={{ color: textColor }}>
              {!locked && design.header.isCollapsible && (
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
              )}
              {design.header.hasBackgroundFilterIcon && <BackgroundFilterIcon />}
              {locked && !isDependent && <LockIcon />}
              <span
                className={
                  'csdk-text-[13px] csdk-mt-[6px] csdk-mb-[4px] csdk-ml-[7px] csdk-leading-[16px]'
                }
                style={{ color: textColor }}
              >
                {title}
              </span>
            </Header>
          </>
        )}

        <main style={{ color: textColor, position: 'relative' }}>
          {renderContent(collapsed, disabled ?? false)}
          {locked && design.header.shouldBeShown && (
            <div
              style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                right: '4px',
                bottom: '4px',
                backgroundColor: 'white',
                opacity: 0.5,
              }}
            />
          )}
        </main>
        {isVertical(arrangement) && design.footer.shouldBeShown && (
          <Footer>
            {!locked && (
              <SisenseSwitchButton
                checked={!disabled}
                size="small"
                inputProps={{ role: 'switch', name: 'tile-switch' }}
                onChange={() => onToggleDisabled?.()}
                theme={themeSettings}
              />
            )}
          </Footer>
        )}
      </Container>
    </GroupHoverWrapper>
  );
};
