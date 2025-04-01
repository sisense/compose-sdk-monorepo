import styled from '@emotion/styled';
import { Focusable } from './types';
import { DEFAULT_TEXT_COLOR } from '@/const';
import { Themable } from '@/theme-provider/types';
import { getElementStateColor } from '@/theme-provider/utils';
import { ElementStates } from '@/types';

export const SelectField = styled.div<Focusable & Themable>`
  width: 100%;
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  background: ${({ theme }) => theme.general.popover.input.backgroundColor};
  color: ${({ theme }) => theme.general.popover.input.textColor};
  height: 28px;
  border-radius: 4px;
  padding-left: 12px;
  border: 1px solid ${({ focus }) => (focus ? DEFAULT_TEXT_COLOR : 'transparent')};
  border-radius: ${({ theme }) => theme.general.popover.input.cornerRadius};
`;

export const SelectItemContainer = styled.div<Themable>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 28px;
  padding-left: 14px;
  padding-right: 14px;
  color: ${({ theme }) =>
    getElementStateColor(
      theme.general.popover.input.dropdownList.item.textColor,
      ElementStates.DEFAULT,
    )};
  transition: color 0.2s ease;
  background-color: ${({ theme }) =>
    getElementStateColor(
      theme.general.popover.input.dropdownList.item.backgroundColor,
      ElementStates.DEFAULT,
    )};
  &:hover {
    background-color: ${({ theme }) =>
      getElementStateColor(
        theme.general.popover.input.dropdownList.item.backgroundColor,
        ElementStates.HOVER,
      )};
  }
`;

export const SelectLabel = styled.span<Themable>`
  display: inline-block;
  flex-grow: 1;
  font-size: 13px;
  font-family: inherit;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: ${({ theme }) => theme.general.popover.input.textColor};
`;

export const DropdownSelectLabel = styled(SelectLabel)<Themable>`
  color: ${({ theme }) => theme.general.popover.input.dropdownList.textColor};
`;

export const SelectIconContainer = styled.span`
  margin-right: 10px;
  margin-left: -4px;
  display: inline-flex;
`;
