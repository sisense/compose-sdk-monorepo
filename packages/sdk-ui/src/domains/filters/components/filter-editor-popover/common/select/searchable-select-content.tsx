import styled from '@emotion/styled';

import { Themable } from '@/infra/contexts/theme-provider/types';

/**
 * Presentational shell shared by `SearchableMultiSelect` and FilterWidget
 * `MembersFilterSelect` — dropdown panel, Select All / Clear All toolbar, and
 * list container.
 * @internal
 */
export const SearchableSelectContent = styled.div<Themable>`
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
  margin: 0 10px;
  height: 32px;
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

/** @internal */
export const SearchableSelectContentList = styled.div<Themable>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.general.popover.content.clickableList.item.textColor};
`;
