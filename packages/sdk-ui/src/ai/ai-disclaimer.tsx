import { Themable } from '@/theme-provider/types';
import styled from '@emotion/styled';
import { CompleteThemeSettings } from '..';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <AiDisclaimerContainer theme={theme}>
      <div>{t('ai.disclaimer.poweredByAi')}</div>
      <div> {t('ai.disclaimer.rateRequest')}</div>
    </AiDisclaimerContainer>
  );
}
