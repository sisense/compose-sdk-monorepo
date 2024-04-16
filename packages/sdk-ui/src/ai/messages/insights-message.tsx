import { GetNlgQueryResultRequest } from '../api/types';
import LightBulbIcon from '../icons/light-bulb-icon';
import LoadingDotsIcon from '../icons/loading-dots-icon';
import TextMessage from './text-message';
import { useGetNlgQueryResultInternal } from '../use-get-nlg-query-result';
import Collapsible from '../common/collapsible';
import { UNEXPECTED_ERROR } from '../api/errors';
import ClickableMessage from './clickable-message';

export function InsightsButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <ClickableMessage align="left" onClick={onClick} disabled={disabled}>
      <div
        className={`csdk-py-[5px] csdk-px-2 csdk-flex csdk-items-center csdk-gap-x-2 csdk-select-none`}
      >
        <LightBulbIcon />
        Insights
      </div>
    </ClickableMessage>
  );
}

type InsightsMessageProps = {
  nlgRequest: GetNlgQueryResultRequest;
  visible?: boolean;
};

export default function InsightsMessage({ nlgRequest, visible = false }: InsightsMessageProps) {
  const { data, isLoading, isError } = useGetNlgQueryResultInternal(nlgRequest, visible);

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
    <TextMessage align="full">
      <Collapsible text={data ?? 'No insights available.'} />
    </TextMessage>
  );
}
