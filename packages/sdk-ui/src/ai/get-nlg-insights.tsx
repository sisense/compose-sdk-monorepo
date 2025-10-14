import { useTranslation } from 'react-i18next';

import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';

import Collapsible from './common/collapsible';
import { useGetNlgInsightsInternal, UseGetNlgInsightsParams } from './use-get-nlg-insights';

/**
 * Props for {@link GetNlgInsights} component.
 */
export interface GetNlgInsightsProps extends Omit<UseGetNlgInsightsParams, 'enabled'> {}

/**
 * React component that fetches and displays a collapsible analysis of the provided query using natural language generation (NLG).
 * Specifying a query is similar to providing parameters to a {@link useExecuteQuery} hook, using dimensions, measures, and filters.
 *
 * @example
 * ```tsx
 * <GetNlgInsights
 *   dataSource="Sample ECommerce"
 *   dimensions={[DM.Commerce.Date.Years]}
 *   measures={[measureFactory.sum(DM.Commerce.Revenue)]}
 * />
 * ```
 * @param props - {@link GetNlgInsightsProps}
 * @returns Collapsible container wrapping a text summary
 * @group Generative AI
 */
export default asSisenseComponent({
  componentName: 'GetNlgInsights',
})(function GetNlgInsights(props: GetNlgInsightsProps) {
  const { data, isLoading, isError } = useGetNlgInsightsInternal(props);
  const { t } = useTranslation();

  if (isError) {
    return <>{t('ai.errors.unexpected')}</>;
  }

  const summary = data ?? t('ai.errors.insightsNotAvailable');

  return <Collapsible text={isLoading ? 'Loading...' : summary} />;
});
