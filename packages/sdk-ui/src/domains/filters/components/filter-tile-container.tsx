import type { FunctionComponent, ReactNode } from 'react';
import { useState } from 'react';

import { css } from '@emotion/react';
import IconButton from '@mui/material/IconButton';
import merge from 'ts-deepmerge';
import { DeepRequired } from 'ts-essentials';

import { BackgroundFilterIcon } from '@/domains/filters/components/icons/background-filter-icon';
import styled from '@/infra/styled';
import { DEFAULT_TEXT_COLOR } from '@/shared/const';
import { getSlightlyDifferentColor } from '@/shared/utils/color';

import { useThemeContext } from '../../../infra/contexts/theme-provider';
import { SisenseSwitchButton, TriangleIndicator } from './common';
import { FilterVariant, isVertical } from './common/filter-utils';
import { BORDER_COLOR, BORDER_THICKNESS, FILTER_TILE_MIN_WIDTH } from './filters-panel/constants';
import { ArrowDownIcon, LockIcon, PencilIcon, TrashIcon } from './icons';

const BaseContainer = styled.div<{ shouldShowBorder: boolean }>`
  width: min-content;
  max-width: 100%;
  align-self: flex-start;
  box-sizing: border-box;

  ${({ shouldShowBorder }) =>
    shouldShowBorder &&
    css`
      border-top: ${BORDER_THICKNESS} solid ${BORDER_COLOR};
      border-bottom: ${BORDER_THICKNESS} solid ${BORDER_COLOR};
      box-shadow: -${BORDER_THICKNESS} 0 0 0 ${BORDER_COLOR},
        ${BORDER_THICKNESS} 0 0 0 ${BORDER_COLOR};
    `}
`;

export const Container = (props: React.ComponentProps<typeof BaseContainer>) => (
  <BaseContainer {...props} className={`csdk-accessible ${props.className ?? ''}`} />
);

const Header = styled.header<{
  shouldShowBorder: boolean;
}>`
  display: flex;
  align-items: center;

  ${({ shouldShowBorder }) =>
    shouldShowBorder &&
    css`
      border-bottom: ${BORDER_THICKNESS} solid ${BORDER_COLOR};
    `}
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 26px;

  border-top: ${BORDER_THICKNESS} solid ${BORDER_COLOR};
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
    disableGroupHover?: boolean;
  };
  border?: {
    shouldBeShown?: boolean;
  };
  footer?: {
    shouldBeShown?: boolean;
  };
}

export type CompleteFilterTileDesignOptions = DeepRequired<FilterTileDesignOptions>;

interface FilterTileContainerProps {
  title?: string;
  renderContent: (collapsed: boolean, tileDisabled: boolean) => ReactNode;
  arrangement?: FilterVariant;
  disabled?: boolean;
  isDependent?: boolean;
  design?: FilterTileDesignOptions;
  onToggleDisabled?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  locked?: boolean;
}

const defaultDesign: CompleteFilterTileDesignOptions = {
  header: {
    shouldBeShown: true,
    hasBorder: true,
    isCollapsible: true,
    hasBackgroundFilterIcon: false,
    disableGroupHover: false,
  },
  border: {
    shouldBeShown: true,
  },
  footer: {
    shouldBeShown: true,
  },
};
/* eslint-disable rulesdir/opacity-zero-needs-focus-visible */
const GroupHoverWrapper = styled.div<{ disableHeaderGroupHover: boolean }>`
  .MuiSwitch-root {
    opacity: 0.55;
    transition: all 0.3s ease;
  }
  .MuiButtonBase-root.csdk-filter-edit-button {
    opacity: 0;
    transition: all 0.3s ease;
    &:focus-visible {
      opacity: 1;
    }
  }
  &:hover {
    .MuiSwitch-root {
      opacity: 1;
    }
    ${({ disableHeaderGroupHover }) =>
      !disableHeaderGroupHover &&
      css`
        .MuiButtonBase-root.csdk-filter-edit-button {
          opacity: 1;
        }
      `}
  }
`;
/* eslint-enable rulesdir/opacity-zero-needs-focus-visible */

/**
 * Generic component that owns common functionality of a filter "tile" like
 * collapsible content and an enable/disable toggle. This is intended to match
 * the style of filter tiles in the right sidebar on a Sisense dashboard.
 */
export const FilterTileContainer: FunctionComponent<FilterTileContainerProps> = (props) => {
  const {
    title,
    renderContent,
    arrangement = 'vertical',
    disabled,
    onToggleDisabled,
    isDependent,
    onDelete,
    onEdit,
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

  return (
    <GroupHoverWrapper disableHeaderGroupHover={design.header.disableGroupHover}>
      <Container
        shouldShowBorder={design.border?.shouldBeShown}
        style={{
          minWidth: isVertical(arrangement) ? FILTER_TILE_MIN_WIDTH : 'auto',
          backgroundColor: disabled ? disabledBgColor : bgColor,
          fontFamily: themeSettings.typography.fontFamily,
        }}
      >
        {isVertical(arrangement) && design.header.shouldBeShown && (
          <>
            {isDependent && <TriangleIndicator />}
            <Header shouldShowBorder={design.header.hasBorder} style={{ color: textColor }}>
              {!locked && design.header.isCollapsible && (
                <IconButton
                  sx={{ padding: 0 }}
                  onClick={() => setCollapsed((value) => !value)}
                  disableRipple
                  disableTouchRipple
                >
                  <ArrowDownIcon
                    aria-label="arrow-down"
                    data-testid="expand-collapse-button"
                    width="16"
                    height="16"
                    fill={`${textColor ?? DEFAULT_TEXT_COLOR}`}
                    className={`csdk-transition csdk-ml-[4px] csdk-cursor-pointer ${
                      collapsed ? '-csdk-rotate-90' : ''
                    }`}
                  />
                </IconButton>
              )}
              {design.header.hasBackgroundFilterIcon && <BackgroundFilterIcon />}
              {locked && !isDependent && <LockIcon />}
              <span
                className={
                  'csdk-text-[13px] csdk-mt-[6px] csdk-mb-[4px] csdk-ml-[7px] csdk-leading-[16px]'
                }
                style={{ color: textColor, flexGrow: 1 }}
              >
                {title}
              </span>
              {onEdit && !disabled && !locked && (
                <IconButton
                  className="csdk-filter-edit-button"
                  onClick={onEdit}
                  sx={{ p: 0, mr: '2px' }}
                  data-testid="filter-edit-button"
                >
                  <PencilIcon color={themeSettings.typography.primaryTextColor} aria-label="edit" />
                </IconButton>
              )}
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
            {onDelete && (
              <IconButton
                onClick={onDelete}
                sx={{ p: 0, mr: 'auto' }}
                disabled={locked}
                data-testid="filter-delete-button"
              >
                <TrashIcon
                  aria-label="trash-bin"
                  fill={`${textColor ?? themeSettings.typography.primaryTextColor}`}
                />
              </IconButton>
            )}
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
