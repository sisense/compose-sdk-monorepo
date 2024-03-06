import { useCallback, useState } from 'react';

import { GetNlgQueryResultRequest } from '../api/types';
import LightBulbIcon from '../icons/light-bulb-icon';
import LoadingDotsIcon from '../icons/loading-dots-icon';
import FeedbackWrapper from './feedback-wrapper';
import TextMessage from './text-message';
import { useGetNlgQueryResultInternal } from '../use-get-nlg-query-result';
import Collapsible from '../common/collapsible';

function InsightsButton({ disabled }: { disabled?: boolean }) {
  const disabledStyle = disabled ? 'csdk-opacity-70' : '';

  return (
    <div
      className={`csdk-my-[-5px] csdk-flex csdk-items-center csdk-gap-x-2 csdk-select-none ${disabledStyle}`}
    >
      <LightBulbIcon />
      Insights
    </div>
  );
}

type InsightsMessageProps = {
  dataSource: string;
  metadata: object[];
};

export default function InsightsMessage({ dataSource, metadata }: InsightsMessageProps) {
  const [visible, setVisible] = useState(false);

  const requestData: GetNlgQueryResultRequest = {
    jaql: {
      datasource: { title: dataSource },
      metadata,
    },
  };

  const { data, isLoading, refetch } = useGetNlgQueryResultInternal(requestData, false);

  const onInsightsClick = useCallback(() => {
    setVisible(true);

    refetch();
  }, [refetch]);

  return (
    <>
      <TextMessage align="right" onClick={!visible ? onInsightsClick : undefined}>
        <InsightsButton disabled={visible} />
      </TextMessage>
      {visible &&
        (isLoading ? (
          <LoadingDotsIcon />
        ) : (
          <FeedbackWrapper sourceId={dataSource} data={requestData} type="nlg/queryResult">
            <TextMessage align="full">
              <Collapsible text={data ?? 'No insights were returned.'} />
            </TextMessage>
          </FeedbackWrapper>
        ))}
    </>
  );
}
