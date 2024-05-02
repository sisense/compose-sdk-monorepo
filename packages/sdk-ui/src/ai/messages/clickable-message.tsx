import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

type Props = {
  children: string | JSX.Element;
  align: 'left' | 'right';
  onClick?: () => void;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

type Alignable = {
  align: 'left' | 'right' | 'full';
};

type Disableable = {
  disabled?: boolean;
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

const MessageButton = styled.div<Themable & Alignable & Disableable>`
  font-size: inherit;
  line-height: inherit;
  border: ${({ theme }) => theme.aiChat.clickableMessages.border};
  padding: 0px;
  user-select: none;
  cursor: pointer;

  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  color: ${({ theme }) => theme.aiChat.clickableMessages.textColor};
  background-color: ${({ theme }) => theme.aiChat.clickableMessages.backgroundColor};
  &:hover {
    color: ${({ theme }) => theme.aiChat.clickableMessages.hover.textColor};
    background-color: ${({ theme }) => theme.aiChat.clickableMessages.hover.backgroundColor};
  }
  border-radius: 20px;

  ${({ align }) =>
    align === 'right'
      ? css`
          text-align: right;
        `
      : css`
          text-align: left;
        `}

  ${({ align }) =>
    align !== 'full'
      ? css`
          max-width: 382px;
        `
      : ''}
`;

export default function ClickableMessage({
  children,
  align,
  onClick,
  disabled,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const { themeSettings } = useThemeContext();

  return (
    <FlexContainer align={align}>
      <MessageButton
        theme={themeSettings}
        onClick={onClick}
        disabled={disabled}
        align={align}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </MessageButton>
    </FlexContainer>
  );
}
