import { useCallback, useState } from 'react';
import { NlqResponseData } from '../api/types';
import { useChatConfig } from '../chat-config';
import ChartMessage from './chart-message';
import FeedbackWrapper from './feedback-wrapper';
import InsightsMessage, { InsightsButton } from './insights-message';
import TextMessage from './text-message';

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

  let chartTypeKeyword =
    'chartType' in chartRecommendations ? chartRecommendations.chartType : 'table';
  if (chartTypeKeyword !== 'table') {
    chartTypeKeyword += ' chart';
  }

  const dataSource = jaql.datasource.title;

  const [showInsights, setShowInsights] = useState(false);

  const onInsightsButtonClick = useCallback(() => {
    setShowInsights(true);
  }, []);

  if (chatMode === 'analyze') {
    return (
      <>
        <TextMessage align="left">
          {`Here is a ${chartTypeKeyword} showing ${data.queryTitle.toLowerCase()}.`}
        </TextMessage>
        <FeedbackWrapper
          sourceId={dataSource}
          data={data}
          type="chats/nlq"
          rightFooter={<InsightsButton onClick={onInsightsButtonClick} disabled={showInsights} />}
        >
          <ChartMessage content={data} dataSource={dataSource} />
        </FeedbackWrapper>
        <InsightsMessage dataSource={dataSource} metadata={jaql.metadata} visible={showInsights} />
      </>
    );
  }

  return (
    <TextMessage align="left">
      {`Returned a ${chartTypeKeyword} showing ${data.queryTitle.toLowerCase()}.`}
    </TextMessage>
  );
}
