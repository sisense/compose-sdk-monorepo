import { memo } from 'react';

import { ChatMessage, NlqResponseData } from '../api/types';
import ChartMessage from './chart-message';
import InsightsMessage from './insights-message';
import TextMessage from './text-message';

type MessageResolverProps = {
  message: ChatMessage;
  sendMessage?: (message: string) => void;
  allowFollowupQuestions?: boolean;
};

function MessageResolver({
  message,
  allowFollowupQuestions,
  sendMessage = () => {},
}: MessageResolverProps) {
  if ('type' in message && message.type === 'nlq') {
    const parsedContent = JSON.parse(message.content) as NlqResponseData;

    const { queryTitle, chartRecommendations, jaql } = parsedContent;
    console.debug(`JAQL for ${queryTitle}`, jaql);
    console.debug(`chart recommendations for ${queryTitle}`, chartRecommendations);

    let chartTypeKeyword =
      'chartType' in chartRecommendations ? chartRecommendations.chartType : 'table';
    if (chartTypeKeyword !== 'table') {
      chartTypeKeyword += ' chart';
    }

    return (
      <>
        <TextMessage align="left">
          {`Here is a ${chartTypeKeyword} showing ${parsedContent.queryTitle.toLowerCase()}.`}
        </TextMessage>
        <ChartMessage content={parsedContent} dataSource={jaql.datasource.title} />
        <InsightsMessage
          dataSource={jaql.datasource.title}
          metadata={parsedContent.jaql.metadata}
        />
        {allowFollowupQuestions && (
          <div className="csdk-flex csdk-flex-col csdk-gap-y-2 csdk-my-[8px]">
            {parsedContent.followupQuestions.slice(0, 2).map((question, i) => (
              <TextMessage
                key={i}
                align="right"
                onClick={() => {
                  sendMessage(question);
                }}
              >
                {question}
              </TextMessage>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <TextMessage align={message.role === 'user' ? 'right' : 'left'}>{message.content}</TextMessage>
  );
}

export default memo(MessageResolver);
