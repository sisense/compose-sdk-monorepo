import { useTranslation } from 'react-i18next';

import { GetNlgInsightsRequest } from '../api/types.js';
import Collapsible from '../common/collapsible.js';
import LoadingDotsIcon from '../icons/loading-dots-icon.js';
import { useGetNlgInsightsInternal } from '../use-get-nlg-insights.js';
import TextMessage from './text-message.js';

type InsightsMessageProps = {
  nlgRequest: GetNlgInsightsRequest;
};

export default function InsightsMessage({ nlgRequest }: InsightsMessageProps) {
  const { data, isLoading, isError } = useGetNlgInsightsInternal(nlgRequest);
  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingDotsIcon />;
  }

  if (isError) {
    return <TextMessage align="left">{t('ai.errors.unexpected')}</TextMessage>;
  }

  return (
    <TextMessage align="full">
      <Collapsible text={data ?? t('ai.errors.insightsNotAvailable')} />
    </TextMessage>
  );
}
