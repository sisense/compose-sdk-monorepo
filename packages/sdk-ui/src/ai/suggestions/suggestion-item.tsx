import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';

const Button = styled.button<Themable>`
  font-size: inherit;
  line-height: inherit;
  box-sizing: border-box;
  border-width: 1px;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  cursor: pointer;
  text-align: left;
  max-width: 85%;

  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.aiChat.suggestions.textColor};
  background-color: ${({ theme }) => theme.aiChat.suggestions.backgroundColor};
  border: ${({ theme }) => theme.aiChat.suggestions.border};
  border-radius: ${({ theme }) => theme.aiChat.suggestions.borderRadius};
  &:hover {
    background-color: ${({ theme }) => theme.aiChat.suggestions.hover.backgroundColor};
    color: ${({ theme }) => theme.aiChat.suggestions.hover.textColor};
  }

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

export interface SuggestedItemProps {
  question: string;
  onClick: () => void;
}

export default function SuggestionItem({ question, onClick }: SuggestedItemProps) {
  const { themeSettings } = useThemeContext();
  return (
    <Button onClick={onClick} theme={themeSettings}>
      {question}
    </Button>
  );
}
