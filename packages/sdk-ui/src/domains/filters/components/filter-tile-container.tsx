import type { FunctionComponent, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import { merge } from 'ts-deepmerge';
import { DeepRequired } from 'ts-essentials';

import { BackgroundFilterIcon } from '@/domains/filters/components/icons/background-filter-icon';
import { DEFAULT_TEXT_COLOR, MIN_TOUCH_TARGET_SIZE } from '@/shared/const';
import type { MenuItem } from '@/shared/types/menu-item';
import { getSlightlyDifferentColor } from '@/shared/utils/color';

import { useThemeContext } from '../../../infra/contexts/theme-provider';
import { Themable } from '../../../infra/contexts/theme-provider/types';
import { FilterTileMenuButton } from '../shared/filter-tile-menu-button';
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

// White info tooltip for the linked indicator. MUI's default tooltip is dark with its
// own font, so it is fully restyled; the font follows the theme, and a 10px collision
// padding keeps it off the viewport edge.
const LinkedTooltip = styled(({ className, ...props }: TooltipProps & Themable) => (
  <Tooltip
    {...props}
    classes={{ popper: className }}
    slotProps={{
      popper: {
        modifiers: [
          { name: 'preventOverflow', options: { padding: 10 } },
          { name: 'offset', options: { offset: [0, 12] } },
        ],
      },
    }}
  />
))`
  & .MuiTooltip-tooltip {
    box-sizing: border-box;
    width: 327px;
    max-width: 327px;
    background-color: #fff;
    color: #5b6372;
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: 13px;
    font-weight: 400;
    line-height: normal;
    padding: 20px 16px;
    margin: 0 !important;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 8px 3px rgba(0, 0, 0, 0.15);
  }
  /* Arrow centered on the tooltip box (not tracking the anchor), overriding the
     inline popper positioning. */
  & .MuiTooltip-arrow {
    color: #fff;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }
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
  /**
   * Determines whether the enable/disable switch is rendered. Rendered by default; hiding it leaves
   * the filter in whichever state it already has.
   *
   * @internal
   */
  toggleVisible?: boolean;
  /**
   * Determines whether the expand/collapse control is rendered. Rendered by default; hiding it
   * leaves the tile in the state it would otherwise have started in.
   *
   * @internal
   */
  expandVisible?: boolean;
  /**
   * Renders the tile read-only: controls stay visible but inert (unlike `locked`),
   * plus a "Linked to filter widget" indicator with an info tooltip.
   *
   * @internal
   */
  linked?: boolean;
  /**
   * Header menu items.
   * When provided, the menu button is shown with these items.
   */
  menuItems?: MenuItem[];
  /**
   * Render header title
   *
   * @internal
   */
  renderHeaderTitle?: (title: React.ReactNode) => React.ReactNode;
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
// Opacity tokens that make a linked tile's inert controls read as disabled. LINKED_TILE_DIM
// dims the caret, menu and member chips; LINKED_TILE_FOOTER_DIM dims the footer (trash +
// toggle) further so it reads as the most inert region. Both dim the theme color already
// present — no hardcoded colors. The title and the linked indicator stay full-strength.
const LINKED_TILE_DIM = 0.5;
const LINKED_TILE_FOOTER_DIM = 0.25;

/* eslint-disable rulesdir/opacity-zero-needs-focus-visible */
/**
 * Wraps a filter tile to drive its group-hover affordances: the edit button is hidden
 * until hover and the on/off switch rests at a lower opacity. When `linked` is true the
 * tile is inert (read-only), so the switch's resting opacity is reset to full and the
 * footer's own dim governs it instead — preventing the two from compounding.
 * @internal
 */
const GroupHoverWrapper = styled.div<{ disableHeaderGroupHover: boolean; linked: boolean }>`
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
  ${({ linked }) =>
    linked &&
    css`
      /* On a linked tile the footer's dim governs the toggle. Reset the switch's own
         resting opacity so it doesn't compound with that dim; the toggle then reads at
         the same level as the trash icon. There is no hover state on an inert tile. */
      .MuiSwitch-root {
        opacity: 1;
      }
    `}
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
    linked = false,
    toggleVisible = true,
    expandVisible = true,
    menuItems,
    renderHeaderTitle = (title) => title,
  } = props;
  // Linked tiles keep controls rendered but inert: pointer-events blocks the mouse and
  // each control is also `disabled` so it is not keyboard-operable.
  const inertStyle = linked ? ({ pointerEvents: 'none' } as const) : undefined;
  const design = merge.withOptions(
    { mergeArrays: false },
    defaultDesign,
    props.design ?? {},
  ) as CompleteFilterTileDesignOptions;
  const [collapsed, setCollapsed] = useState(true);
  // The footer holds the delete button and the enable/disable switch, and carries a top border and a
  // minimum height of its own. Withholding the switch makes it possible for both to be absent at
  // once, which would leave an empty bordered strip, so the footer goes with them. A locked tile is
  // the exception: it renders no footer content either, but has always kept the footer, and dropping
  // it there would change tiles this configuration does not touch.
  const shouldShowFooter = design.footer.shouldBeShown && (locked || !!onDelete || toggleVisible);

  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();

  const { backgroundColor: bgColor } = themeSettings.general;
  const { primaryTextColor: textColor, secondaryTextColor } = themeSettings.typography;
  const disabledBgColor = getSlightlyDifferentColor(bgColor, 0.1);

  return (
    <GroupHoverWrapper
      disableHeaderGroupHover={design.header.disableGroupHover}
      linked={linked}
      data-testid="csdk-filter-tile-container"
    >
      <Container
        shouldShowBorder={design.border?.shouldBeShown}
        style={{
          minWidth: isVertical(arrangement) ? FILTER_TILE_MIN_WIDTH : 'auto',
          // Linked tiles are grayed out like disabled ones.
          backgroundColor: disabled || linked ? disabledBgColor : bgColor,
          fontFamily: themeSettings.typography.fontFamily,
        }}
      >
        {isVertical(arrangement) && design.header.shouldBeShown && (
          <>
            {isDependent && <TriangleIndicator />}
            <Header
              shouldShowBorder={design.header.hasBorder}
              style={{ color: textColor, ...inertStyle }}
            >
              {!locked && design.header.isCollapsible && expandVisible && (
                <IconButton
                  sx={{ p: '4px', ...(linked ? { opacity: LINKED_TILE_DIM } : {}) }}
                  onClick={() => setCollapsed((value) => !value)}
                  disabled={linked}
                  disableRipple
                  disableTouchRipple
                >
                  <ArrowDownIcon
                    aria-label="arrow-down"
                    data-testid="expand-collapse-button"
                    width="16"
                    height="16"
                    fill={`${textColor ?? DEFAULT_TEXT_COLOR}`}
                    className={`csdk-transition csdk-cursor-pointer ${
                      collapsed ? '-csdk-rotate-90' : ''
                    }`}
                  />
                </IconButton>
              )}
              {design.header.hasBackgroundFilterIcon && <BackgroundFilterIcon />}
              {locked && !isDependent && <LockIcon />}
              <div style={{ flexGrow: 1 }}>
                {renderHeaderTitle(
                  <span
                    className={'csdk-text-[13px] csdk-mt-[6px] csdk-mb-[4px] csdk-leading-[16px]'}
                    style={{ color: textColor, display: 'inline-block' }}
                  >
                    {title}
                  </span>,
                )}
              </div>
              {onEdit && !disabled && !locked && !linked && (
                <IconButton
                  className="csdk-filter-edit-button"
                  onClick={onEdit}
                  sx={{ p: 0, mr: '2px', ...MIN_TOUCH_TARGET_SIZE }}
                  data-testid="filter-edit-button"
                >
                  <PencilIcon color={themeSettings.typography.primaryTextColor} aria-label="edit" />
                </IconButton>
              )}
              {menuItems &&
                menuItems.length > 0 &&
                (linked ? (
                  // Wrapped so the dim applies to the button (it exposes no style prop).
                  <span style={{ display: 'inline-flex', opacity: LINKED_TILE_DIM }}>
                    <FilterTileMenuButton menuItems={menuItems} disabled={linked} />
                  </span>
                ) : (
                  <FilterTileMenuButton menuItems={menuItems} disabled={linked} />
                ))}
            </Header>
          </>
        )}

        <main
          style={{
            color: textColor,
            position: 'relative',
            ...inertStyle,
            ...(linked ? { opacity: LINKED_TILE_DIM } : {}),
          }}
        >
          {renderContent(collapsed, (disabled ?? false) || linked)}
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
        {linked && (
          <div
            data-testid="filter-tile-linked-indicator"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              margin: '4px 6px',
              padding: '2px 8px',
              fontSize: '11px',
              color: secondaryTextColor,
              backgroundColor: bgColor,
              border: `${BORDER_THICKNESS} solid ${BORDER_COLOR}`,
              borderRadius: '2px',
            }}
          >
            <span>{t('filterTile.linkedToWidget.label')}</span>
            <LinkedTooltip
              title={t('filterTile.linkedToWidget.tooltip')}
              placement="bottom"
              arrow
              theme={themeSettings}
            >
              <span
                role="button"
                tabIndex={0}
                aria-label="Linked to filter widget info"
                data-testid="filter-tile-linked-info"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // 24x24 icon hit area keeps the indicator row (and tile) height
                  // consistent with the other icon buttons.
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
                  <rect x="7.25" y="7" width="1.5" height="4" rx="0.75" fill="currentColor" />
                  <circle cx="8" cy="4.75" r="0.9" fill="currentColor" />
                </svg>
              </span>
            </LinkedTooltip>
          </div>
        )}
        {isVertical(arrangement) && shouldShowFooter && (
          <Footer style={{ ...inertStyle, ...(linked ? { opacity: LINKED_TILE_FOOTER_DIM } : {}) }}>
            {onDelete && !locked && (
              <IconButton
                onClick={onDelete}
                disabled={linked}
                sx={{ p: 0, mr: 'auto', ...MIN_TOUCH_TARGET_SIZE }}
                data-testid="filter-delete-button"
              >
                <TrashIcon
                  aria-label="trash-bin"
                  fill={`${textColor ?? themeSettings.typography.primaryTextColor}`}
                />
              </IconButton>
            )}
            {!locked && toggleVisible && (
              <SisenseSwitchButton
                checked={!disabled}
                disabled={linked}
                size="small"
                inputProps={{
                  role: 'switch',
                  name: 'tile-switch',
                  'aria-label': t('filterTile.toggleSwitch'),
                }}
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
