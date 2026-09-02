import { ComponentPropsWithoutRef } from 'react';

import styled from '@emotion/styled';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';

import { Themable } from '@/infra/contexts/theme-provider/types';

/**
 * Presentational shell shared by `SearchableMultiSelect` and FilterWidget
 * `MembersFilterSelect` — dropdown panel, Select All / Clear All toolbar, and
 * list container.
 * @internal
 */
export const SearchableSelectContent = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  max-height: 320px;
  color: ${({ theme }) => theme.general.popover.input.dropdownList.textColor};
  background-color: ${({ theme }) => theme.general.popover.input.dropdownList.backgroundColor};
  border-radius: ${({ theme }) => theme.general.popover.input.dropdownList.cornerRadius};
  box-shadow: ${({ theme }) => theme.general.popover.input.dropdownList.shadow};
`;

/** @internal */
export const SearchableSelectContentToolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  border-bottom: 1px solid #e7e8ea;
  margin: 0;
  padding: 0 10px;
  height: 32px;
  flex-shrink: 0;
`;

/** @internal */
export const SearchableSelectContentToolbarButton = styled.button<Themable>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  border: none;
  background: none;
  color: ${({ theme }) => theme.typography.hyperlinkColor};
  &:hover {
    color: ${({ theme }) => theme.typography.hyperlinkHoverColor};
  }
  padding: 0;
  font-size: 11px;
  &:disabled {
    opacity: 0.4;
  }
`;

// Matches the linked-filter tooltip in `filter-tile-container`. Styled through the popper
// class because the tooltip renders in a portal, out of reach of a nested selector.
const SearchableSelectContentToolbarTooltip = styled(
  ({ className, theme, ...props }: TooltipProps & Themable) => (
    <Tooltip
      {...props}
      arrow
      placement="bottom"
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
  ),
)`
  & .MuiTooltip-tooltip {
    box-sizing: border-box;
    max-width: 300px;
    background-color: #fff;
    color: #5b6372;
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: 13px;
    font-weight: 400;
    line-height: normal;
    padding: 12px 16px;
    margin: 0 !important;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 8px 3px rgba(0, 0, 0, 0.15);
  }
  /* Left to track the anchor, unlike the filter-tile tooltip, which centres its arrow:
     this one hangs off a button at the end of the toolbar, not a lone icon. */
  & .MuiTooltip-arrow {
    color: #fff;
  }
`;

// To keep both buttons aligned.
const ToolbarButtonTooltipTarget = styled.span`
  display: flex;
`;

type SearchableSelectContentToolbarButtonWithTooltipProps = ComponentPropsWithoutRef<'button'> &
  Themable & {
    tooltipTitle: string;
    disableTooltip?: boolean;
  };

/**
 * Toolbar button that explains itself while disabled. A disabled `<button>` fires no mouse
 * events, so the wrapping `span` takes the hover — same shape as `SecondaryButtonWithTooltip`.
 * @internal
 */
export const SearchableSelectContentToolbarButtonWithTooltip = ({
  tooltipTitle,
  disableTooltip = false,
  disabled,
  style,
  theme,
  children,
  ...buttonProps
}: SearchableSelectContentToolbarButtonWithTooltipProps) => (
  <SearchableSelectContentToolbarTooltip
    title={tooltipTitle}
    disableHoverListener={disableTooltip}
    theme={theme}
  >
    <ToolbarButtonTooltipTarget>
      <SearchableSelectContentToolbarButton
        {...buttonProps}
        disabled={disabled}
        theme={theme}
        style={disabled ? { ...style, pointerEvents: 'none' } : style}
      >
        {children}
      </SearchableSelectContentToolbarButton>
    </ToolbarButtonTooltipTarget>
  </SearchableSelectContentToolbarTooltip>
);

/** @internal */
export const SearchableSelectContentList = styled.div<Themable>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.general.popover.content.clickableList.item.textColor};
`;
