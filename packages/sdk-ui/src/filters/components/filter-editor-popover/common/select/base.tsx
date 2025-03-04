import styled from '@emotion/styled';
import { Focusable } from './types';
import { getSlightlyDifferentColor } from '@/utils/color';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR } from '@/const';

export const SelectContainer = styled.div<Focusable>`
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  background: ${DEFAULT_BACKGROUND_COLOR};
  height: 28px;
  border-radius: 4px;
  padding-left: 12px;
  border: 1px solid ${({ focus }) => (focus ? DEFAULT_TEXT_COLOR : 'transparent')};
`;

export const SelectItemContainer = styled.div<{ background?: string; color?: string }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 28px;
  padding-left: 14px;
  padding-right: 14px;
  color: ${({ color = DEFAULT_TEXT_COLOR }) => color};
  transition: color 0.2s ease;
  background-color: ${({ background = 'transparent' }) => background};
  &:hover {
    background-color: ${({ background }) =>
      background ? getSlightlyDifferentColor(background, 0.03) : DEFAULT_BACKGROUND_COLOR};
  }
`;

export const SelectLabel = styled.span`
  display: inline-block;
  flex-grow: 1;
  font-size: 13px;
  font-family: inherit;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SelectIconContainer = styled.span`
  margin-right: 10px;
  margin-left: -4px;
  display: inline-flex;
`;
