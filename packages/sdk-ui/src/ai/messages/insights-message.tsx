import { GetNlgQueryResultRequest } from '../api/types';
import LightBulbIcon from '../icons/light-bulb-icon';
import LoadingDotsIcon from '../icons/loading-dots-icon';
import FeedbackWrapper from './feedback-wrapper';
import TextMessage from './text-message';
import { useGetNlgQueryResultInternal } from '../use-get-nlg-query-result';
import Collapsible from '../common/collapsible';
import { MetadataItem } from '@sisense/sdk-query-client';
import { UNEXPECTED_ERROR } from '../api/errors';

export function InsightsButton({
  onClick,
  disabled,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  const disabledStyle = disabled ? 'csdk-opacity-70' : '';

  return (
    <TextMessage align="right" onClick={!disabled ? onClick : undefined}>
      <div
        className={`csdk-my-[-5px] csdk-flex csdk-items-center csdk-gap-x-2 csdk-select-none ${disabledStyle}`}
      >
        <LightBulbIcon />
        Insights
      </div>
    </TextMessage>
  );
}

type InsightsMessageProps = {
  dataSource: string;
  metadata: object[];
  visible?: boolean;
};

export default function InsightsMessage({
  dataSource,
  metadata,
  visible = false,
}: InsightsMessageProps) {
  const requestData: GetNlgQueryResultRequest = {
    jaql: {
      datasource: dataSource,
      metadata: metadata as MetadataItem[],
    },
  };

  const { data, isLoading, isError } = useGetNlgQueryResultInternal(requestData, visible);

  if (!visible) {
    return null;
  }

  if (isLoading) {
    return <LoadingDotsIcon />;
  }

  if (isError) {
    return <TextMessage align="left">{UNEXPECTED_ERROR}</TextMessage>;
  }

  return (
    <FeedbackWrapper sourceId={dataSource} data={requestData} type="nlg/queryResult">
      <TextMessage align="full">
        <Collapsible text={data ?? 'No insights available.'} />
      </TextMessage>
    </FeedbackWrapper>
  );
}
