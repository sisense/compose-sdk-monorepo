import Color from 'colorjs.io';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';

import ScrollToBottomIcon from '../icons/scroll-to-bottom-icon.js';

const getRgba = (color: string, alpha: number) => {
  const rgbaColor = new Color(color);
  rgbaColor.alpha = alpha;
  return rgbaColor;
};

const Container = styled.div<Themable>`
  font-size: inherit;
  line-height: inherit;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 4px;
  border-radius: 16px;
  margin-bottom: 4px;
  box-shadow: ${({ theme }) => `0 4px 8px 0 ${getRgba(theme.aiChat.primaryTextColor, 0.2)}`};
  cursor: pointer;
  color: ${({ theme }) => theme.aiChat.clickableMessages.textColor};
  background-color: ${({ theme }) => theme.aiChat.clickableMessages.backgroundColor};

  &:hover {
    color: ${({ theme }) => theme.aiChat.clickableMessages.hover.textColor};
    background-color: ${({ theme }) => theme.aiChat.clickableMessages.hover.backgroundColor};
    box-shadow: none;
`;

export const ScrollToBottomButton = ({ onClick }: { onClick: () => void }) => {
  const { themeSettings } = useThemeContext();
  return (
    <Container theme={themeSettings} onClick={onClick}>
      <ScrollToBottomIcon />
    </Container>
  );
};
