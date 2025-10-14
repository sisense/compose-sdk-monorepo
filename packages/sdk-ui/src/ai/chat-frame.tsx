import { CSSProperties } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Themable } from '@/theme-provider/types';

const MIN_ALLOWED_WIDTH = 500;
const MIN_ALLOWED_HEIGHT = 500;

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 900;

type Sizable = {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
};

export const ChatFrame = styled.div<Themable & Sizable>`
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #c6c9ce;
  border-radius: ${({ theme }) => theme.aiChat.borderRadius};
  background-color: ${({ theme }) => theme.aiChat.backgroundColor};
  overflow: hidden;

  min-width: ${MIN_ALLOWED_WIDTH}px;
  min-height: ${MIN_ALLOWED_HEIGHT}px;
  width: ${({ width }) => (width ? getCssProp(width) : `${DEFAULT_WIDTH}px`)};
  height: ${({ height }) => (height ? getCssProp(height) : `${DEFAULT_HEIGHT}px`)};

  ${({ theme }) => css`
    font-size: ${theme.aiChat.primaryFontSize[0]};
    line-height: ${theme.aiChat.primaryFontSize[1]};
  `}
  border: ${({ theme }) => (theme.aiChat.border === false ? 'none' : theme.aiChat.border)};
`;

function getCssProp(widthOrHeight: number | string) {
  return typeof widthOrHeight === 'number' ? `${widthOrHeight}px` : widthOrHeight;
}
