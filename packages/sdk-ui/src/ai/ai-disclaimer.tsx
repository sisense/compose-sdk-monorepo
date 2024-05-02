import { Themable } from '@/theme-provider/types';
import styled from '@emotion/styled';
import { CompleteThemeSettings } from '..';

const AiDisclaimerContainer = styled.div<Themable>`
  text-align: center;
  font-size: 11px;
  line-height: 18px;
  white-space: pre-wrap;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  color: ${({ theme }) => theme.aiChat.secondaryTextColor};
`;

export default function AiDisclaimer({ theme }: { theme: CompleteThemeSettings }) {
  return (
    <AiDisclaimerContainer theme={theme}>
      <div>Content is powered by AI, so surprises and mistakes are possible.</div>
      <div> Please rate responses so we can improve!</div>
    </AiDisclaimerContainer>
  );
}
