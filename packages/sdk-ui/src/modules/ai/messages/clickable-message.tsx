import { css } from '@emotion/react';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import styled from '@/infra/styled';

type Props = {
  children: string | JSX.Element;
  align: 'left' | 'right';
  onClick?: () => void;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  accessibleName?: string;
};

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

const MessageButton = styled.button<Themable & Alignable>`
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  border: ${({ theme }) => theme.aiChat.clickableMessages.border};
  padding: 0;
  cursor: pointer;

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

  ${({ theme }) => {
    const { borderGradient, borderRadius } = theme.aiChat.suggestions;
    if (borderGradient) {
      const [firstColor, secondColor] = borderGradient;
      return css`
        border: none;
        position: relative;
        border-radius: ${borderRadius};
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: ${borderRadius};
          border: 1px solid transparent;
          background: linear-gradient(30deg, ${firstColor}, ${secondColor}) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
        }
      `;
    }
    return '';
  }}
`;

export default function ClickableMessage({
  children,
  align,
  onClick,
  onMouseEnter,
  onMouseLeave,
  accessibleName,
}: Props) {
  const { themeSettings } = useThemeContext();

  return (
    <FlexContainer align={align}>
      <MessageButton
        aria-label={accessibleName}
        theme={themeSettings}
        onClick={onClick}
        align={align}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </MessageButton>
    </FlexContainer>
  );
}
