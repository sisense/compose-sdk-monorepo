import { useCallback, useState } from 'react';

import { useGetNlgQueryResult } from '../api/hooks';
import LightBulbIcon from '../icons/light-bulb-icon';
import LoadingDotsIcon from '../icons/loading-dots-icon';
import TextMessage from './text-message';

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

export function InsightsSummary({ summary }: { summary: string }) {
  const [collapsed, setCollapsed] = useState(true);

  const showCollapse = summary.length > 200;

  return (
    <div>
      <div className={`${collapsed ? 'csdk-line-clamp-5' : ''} csdk-whitespace-pre-wrap`}>
        {summary}
      </div>
      <div className="csdk-mt-3 csdk-flex csdk-justify-between">
        <div className="csdk-text-text-disabled csdk-text-[10px]">{'Powered by AI'}</div>
        {showCollapse && (
          <div
            className="csdk-text-ai-xs csdk-text-text-link csdk-cursor-pointer"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? 'Read more' : 'Collapse'}
          </div>
        )}
      </div>
    </div>
  );
}

type InsightsMessageProps = {
  dataSource: string;
  metadata: unknown[];
};

export default function InsightsMessage({ dataSource, metadata }: InsightsMessageProps) {
  const [visible, setVisible] = useState(false);

  const { data, isLoading, refetch } = useGetNlgQueryResult({
    dataSource,
    metadata,
    enabled: false,
  });
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
          <TextMessage align="left">
            <InsightsSummary summary={data ?? 'No insights were returned.'} />
          </TextMessage>
        ))}
    </>
  );
}
