import styled from '@emotion/styled';
import { Focusable } from './types';

export const SelectContainer = styled.div<Focusable>`
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  background: #f4f4f8;
  height: 28px;
  border-radius: 4px;
  padding-left: 12px;
  border: 1px solid ${({ focus }) => (focus ? '#5b6372' : '#f4f4f8')};
`;

export const SelectItemContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 28px;
  padding-left: 14px;
  padding-right: 14px;
  color: #5b6372;
  transition: color 0.2s ease;
  &:hover {
    background-color: #f4f4f8;
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
