import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FC, PropsWithChildren } from 'react';

type Alignable = {
  align: 'left' | 'right' | 'full';
};

const FlexContainer = styled.div<Alignable>`
  display: flex;

  ${({ align }) =>
    align === 'right'
      ? css`
          justify-content: flex-end;
        `
      : css`
          justify-content: flex-start;
        `}
`;

export const MessageContainer = styled.div<Themable & Alignable>`
  font-size: inherit;
  line-height: inherit;
  padding-top: 8.5px;
  padding-bottom: 8.5px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  box-sizing: border-box;

  ${({ align }) =>
    align === 'right'
      ? css`
          text-align: right;
          border-radius: 10px 10px 0px 10px;
        `
      : css`
          text-align: left;
          border-radius: 10px 10px 10px 0px;
        `}

  ${({ align }) =>
    align !== 'full'
      ? css`
          max-width: 85%;
        `
      : ''}

  color: ${({ theme }) => theme.aiChat.primaryTextColor};
  background-color: ${({ theme, align }) =>
    align === 'right'
      ? theme.aiChat.userMessages.backgroundColor
      : theme.aiChat.systemMessages.backgroundColor};
`;

const TextMessage: FC<PropsWithChildren<Alignable>> = ({ align, children }) => {
  const { themeSettings } = useThemeContext();
  return (
    <FlexContainer theme={themeSettings} align={align}>
      <MessageContainer theme={themeSettings} align={align}>
        {children}
      </MessageContainer>
    </FlexContainer>
  );
};

export default TextMessage;
