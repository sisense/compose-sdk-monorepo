import { GetNlgInsightsRequest } from '../api/types';
import LoadingDotsIcon from '../icons/loading-dots-icon';
import TextMessage from './text-message';
import { useGetNlgInsightsInternal } from '../use-get-nlg-insights';
import Collapsible from '../common/collapsible';
import { useTranslation } from 'react-i18next';

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
