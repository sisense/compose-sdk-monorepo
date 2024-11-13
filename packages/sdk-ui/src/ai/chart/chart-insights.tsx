import { GetNlgQueryResultRequest } from '@/ai';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';
import { useGetNlgQueryResultInternal } from '@/ai/use-get-nlg-query-result';
import FeedbackWrapper from '@/ai/messages/feedback-wrapper';
import Collapsible from '@/ai/common/collapsible';
import AiIcon from '@/ai/icons/ai-icon';
import { useTranslation } from 'react-i18next';
import LoadingDotsIcon from '@/ai/icons/loading-dots-icon';

export interface ChartInsightsProps {
  nlgRequest: GetNlgQueryResultRequest;
}

const FlexDiv = styled.div<Themable>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 24px 0;
`;

const IconDiv = styled.div<Themable>`
  align-self: flex-start;
`;

export const ChartInsights = ({ nlgRequest }: ChartInsightsProps) => {
  const { themeSettings } = useThemeContext();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useGetNlgQueryResultInternal(nlgRequest);

  if (isError) {
    return <>{t('ai.errors.unexpected')}</>;
  }

  if (isLoading) {
    return <LoadingDotsIcon />;
  }

  const summary = data ?? t('ai.errors.insightsNotAvailable');

  return (
    <FeedbackWrapper
      sourceId={nlgRequest.jaql.datasource.title}
      data={nlgRequest}
      type="chart/insights"
      buttonVisibility="always"
      renderContent={(buttonRow) => (
        <FlexDiv theme={themeSettings}>
          <IconDiv theme={themeSettings}>
            <AiIcon theme={themeSettings}></AiIcon>
          </IconDiv>
          <Collapsible text={summary} />
          {buttonRow}
        </FlexDiv>
      )}
    />
  );
};
