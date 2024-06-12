import { useThemeContext } from '@/theme-provider';
import { Themable } from '@/theme-provider/types';
import styled from '@emotion/styled';

const Container = styled.div<Themable>`
  font-size: inherit;
  line-height: inherit;
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 4px;
  padding-bottom: 4px;
  border-radius: 16px;

  color: ${({ theme }) => theme.aiChat.suggestions.textColor};
  background-color: ${({ theme }) => theme.aiChat.suggestions.backgroundColor};
`;
export const BetaLabel = () => {
  const { themeSettings } = useThemeContext();
  return <Container theme={themeSettings}>Beta</Container>;
};
