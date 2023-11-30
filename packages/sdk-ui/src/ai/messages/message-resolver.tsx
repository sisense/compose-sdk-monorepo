import { memo } from 'react';

import { ChatMessage, NlqResponseData } from '../api/types';
import ChartMessage from './chart-message';
import InsightsMessage from './insights-message';
import TextMessage from './text-message';

type MessageResolverProps = {
  message: ChatMessage;
  // TODO: consider removing dataSource and simply passing chart message, since datasource
  // is included in the jaql
  dataSource: string;
  sendMessage?: (message: string) => void;
  allowFollowupQuestions?: boolean;
};

function MessageResolver({
  message,
  dataSource,
  allowFollowupQuestions,
  sendMessage = () => {},
}: MessageResolverProps) {
  if ('type' in message && message.type === 'nlq') {
    const parsedContent = JSON.parse(message.content) as NlqResponseData;

    const { queryTitle, chartRecommendations, jaql } = parsedContent;
    console.debug(`JAQL for ${queryTitle}`, jaql);
    console.debug(`chart recommendations for ${queryTitle}`, chartRecommendations);

    let chartTypeKeyword = chartRecommendations.chartType;
    if (chartTypeKeyword !== 'table') {
      chartTypeKeyword += ' chart';
    }

    return (
      <>
        <TextMessage align="left">
          {`Here is a ${chartTypeKeyword} showing ${parsedContent.queryTitle.toLowerCase()}.`}
        </TextMessage>
        <ChartMessage content={parsedContent} dataSource={dataSource} />
        <InsightsMessage dataSource={dataSource} metadata={parsedContent.jaql.metadata} />
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
