import { GetNlgQueryResultRequest } from '../api/types';
import LoadingDotsIcon from '../icons/loading-dots-icon';
import TextMessage from './text-message';
import { useGetNlgQueryResultInternal } from '../use-get-nlg-query-result';
import Collapsible from '../common/collapsible';
import { UNEXPECTED_ERROR } from '../api/errors';

type InsightsMessageProps = {
  nlgRequest: GetNlgQueryResultRequest;
};

export default function InsightsMessage({ nlgRequest }: InsightsMessageProps) {
  const { data, isLoading, isError } = useGetNlgQueryResultInternal(nlgRequest);

  if (isLoading) {
    return <LoadingDotsIcon />;
  }

  if (isError) {
    return <TextMessage align="left">{UNEXPECTED_ERROR}</TextMessage>;
  }

  return (
    <TextMessage align="full">
      <Collapsible text={data ?? 'No insights available.'} />
    </TextMessage>
  );
}
