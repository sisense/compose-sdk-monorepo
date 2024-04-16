import { useCallback, useState } from 'react';
import { GetNlgQueryResultRequest, NlqResponseData } from '../api/types';
import { useChatConfig } from '../chat-config';
import ChartMessage from './chart-message';
import FeedbackWrapper from './feedback-wrapper';
import InsightsMessage, { InsightsButton } from './insights-message';
import TextMessage from './text-message';

const startsWithVowel = (s: string | null | undefined): boolean => !!s && 'aeiou'.includes(s[0]);

/**
 * Renders a NLQ response as a series of chat messages/buttons.
 *
 * @internal
 */
export default function NlqMessageGroup({ data }: { data: NlqResponseData }) {
  const { chatMode = 'analyze' } = useChatConfig();

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

  if (chatMode === 'analyze') {
    return (
      <>
        <FeedbackWrapper sourceId={dataSource} data={data} type="chats/nlq">
          <TextMessage align="left">
            {`Here is ${chartTypeSegment} showing ${data.queryTitle.toLowerCase()}.`}
          </TextMessage>
          <ChartMessage content={data} dataSource={dataSource} />
        </FeedbackWrapper>
        <FeedbackWrapper
          sourceId={dataSource}
          data={nlgRequest}
          type="nlg/queryResult"
          visible={showInsights}
        >
          <InsightsButton onClick={onInsightsButtonClick} disabled={showInsights} />
          <InsightsMessage nlgRequest={nlgRequest} visible={showInsights} />
        </FeedbackWrapper>
      </>
    );
  }

  return (
    <FeedbackWrapper sourceId={dataSource} data={data} type="chats/nlq">
      <TextMessage align="left">
        {`Returned ${chartTypeSegment} showing ${data.queryTitle.toLowerCase()}.`}
      </TextMessage>
    </FeedbackWrapper>
  );
}
