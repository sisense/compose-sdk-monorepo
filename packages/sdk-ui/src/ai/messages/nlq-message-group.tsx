/* eslint-disable complexity */
import { useCallback, useState } from 'react';
import { GetNlgQueryResultRequest, NlqResponseData } from '../api/types';
import { useChatConfig } from '../chat-config';
import ChartMessage from './chart-message';
import FeedbackWrapper from './feedback-wrapper';
import InsightsMessage, { InsightsButton } from './insights-message';
import TextMessage from './text-message';

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

  const { queryTitle, chartRecommendations, jaql } = data;
  console.debug(`JAQL for ${queryTitle}`, jaql);
  console.debug(`chart recommendations for ${queryTitle}`, chartRecommendations);

  const chartType = 'chartType' in chartRecommendations ? chartRecommendations.chartType : 'table';
  let chartTypeSegment;
  if (startsWithVowel(chartType)) {
    chartTypeSegment = `an ${chartType}`;
  } else {
    chartTypeSegment = `a ${chartType}`;
  }
  if (chartType !== 'table') {
    chartTypeSegment += ' chart';
  }

  const dataSource = jaql.datasource.title;

  const [showInsights, setShowInsights] = useState(false);

  const onInsightsButtonClick = useCallback(() => {
    setShowInsights(true);
  }, []);

  const nlgRequest: GetNlgQueryResultRequest = {
    jaql: {
      datasource: dataSource,
      metadata: jaql.metadata,
    },
  };

  const isAnalyzeMode = chatMode === 'analyze';

  return (
    <>
      <FeedbackWrapper
        sourceId={dataSource}
        data={data}
        type="chats/nlq"
        buttonVisibility={alwaysShowFeedback ? 'always' : 'onHover'}
      >
        <TextMessage align="left">
          {isAnalyzeMode
            ? `Here is ${chartTypeSegment} showing ${data.queryTitle.toLowerCase()}.`
            : `Returned ${chartTypeSegment} showing ${data.queryTitle.toLowerCase()}.`}
        </TextMessage>
        {isAnalyzeMode && <ChartMessage content={data} dataSource={dataSource} />}
      </FeedbackWrapper>
      {enableInsights && (
        <FeedbackWrapper
          sourceId={dataSource}
          data={nlgRequest}
          type="nlg/queryResult"
          buttonVisibility={showInsights ? 'onHover' : 'never'}
        >
          <InsightsButton onClick={onInsightsButtonClick} disabled={showInsights} />
          <InsightsMessage nlgRequest={nlgRequest} visible={showInsights} />
        </FeedbackWrapper>
      )}
    </>
  );
}
