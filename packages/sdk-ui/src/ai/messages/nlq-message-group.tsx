/* eslint-disable complexity */
import { useCallback, useState } from 'react';
import { GetNlgQueryResultRequest, NlqResponseData } from '../api/types';
import { useChatConfig } from '../chat-config';
import ChartMessage from './chart-message';
import FeedbackWrapper from './feedback-wrapper';
import InsightsMessage from './insights-message';
import InsightsButton from '../buttons/insights-button';
import { MessageContainer } from './text-message';
import styled from '@emotion/styled';
import { useThemeContext } from '@/theme-provider';

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`;

const startsWithVowel = (s: string | null | undefined): boolean => !!s && 'aeiou'.includes(s[0]);

interface NlqMessageGroupProps {
  data: NlqResponseData;
  alwaysShowFeedback?: boolean;
}

/**
 * Renders a NLQ response as a series of chat messages/buttons.
 *
 * @internal
 */
export default function NlqMessageGroup({ data, alwaysShowFeedback }: NlqMessageGroupProps) {
  const { chatMode = 'analyze', enableInsights } = useChatConfig();
  const { themeSettings } = useThemeContext();

  const { queryTitle, chartRecommendations, jaql } = data;
  console.debug(`JAQL for ${queryTitle}`, jaql);
  console.debug(`chart recommendations for ${queryTitle}`, chartRecommendations);

  const chartType = 'chartType' in chartRecommendations ? chartRecommendations.chartType : 'table';
  let chartTypeSegment: string;
  if (startsWithVowel(chartType)) {
    chartTypeSegment = `an ${chartType}`;
  } else {
    chartTypeSegment = `a ${chartType}`;
  }
  if (chartType !== 'table') {
    chartTypeSegment += ' chart';
  }

  const dataSourceTitle = jaql.datasource.title;

  const [showInsights, setShowInsights] = useState(false);

  const onInsightsButtonClick = useCallback(() => {
    setShowInsights((prev) => !prev);
  }, []);

  const nlgRequest: GetNlgQueryResultRequest = {
    jaql: {
      datasource: jaql.datasource,
      metadata: jaql.metadata,
    },
  };

  const isAnalyzeMode = chatMode === 'analyze';

  return (
    <>
      <FeedbackWrapper
        sourceId={dataSourceTitle}
        data={data}
        type="chats/nlq"
        buttonVisibility={alwaysShowFeedback ? 'always' : 'onHover'}
        renderContent={(buttonRow) => (
          <>
            <FlexRow>
              <MessageContainer align="left" theme={themeSettings}>
                {`Here's ${chartTypeSegment} showing ${data.queryTitle.toLowerCase()}.`}
              </MessageContainer>
              {buttonRow}
            </FlexRow>
            {isAnalyzeMode && <ChartMessage content={data} dataSource={dataSourceTitle} />}
          </>
        )}
      />
      {enableInsights && (
        <FeedbackWrapper
          sourceId={dataSourceTitle}
          data={nlgRequest}
          type="nlg/queryResult"
          buttonVisibility={showInsights ? 'onHover' : 'never'}
          renderContent={(buttonRow) => (
            <>
              <FlexRow>
                <InsightsButton onClick={onInsightsButtonClick} />
                {buttonRow}
              </FlexRow>
              {showInsights && <InsightsMessage nlgRequest={nlgRequest} />}
            </>
          )}
        />
      )}
    </>
  );
}
