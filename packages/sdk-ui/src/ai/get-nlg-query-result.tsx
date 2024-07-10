import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { UNEXPECTED_ERROR } from './api/errors';
import Collapsible from './common/collapsible';
import {
  useGetNlgQueryResultInternal,
  UseGetNlgQueryResultParams,
} from './use-get-nlg-query-result';

/**
 * Props for {@link GetNlgQueryResult} component.
 */
export interface GetNlgQueryResultProps extends Omit<UseGetNlgQueryResultParams, 'enabled'> {}

/**
 * React component that fetches and displays a collapsible analysis of the provided query using natural language generation (NLG).
 * Specifying a query is similar to providing parameters to a {@link useExecuteQuery} hook, using dimensions, measures, and filters.
 *
 * ::: warning Note
 * This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
 * :::
 *
 * @example
 * ```tsx
 * <GetNlgQueryResult
 *   dataSource="Sample ECommerce"
 *   dimensions={[DM.Commerce.Date.Years]}
 *   measures={[measureFactory.sum(DM.Commerce.Revenue)]}
 * />
 * ```
 * @param props - {@link GetNlgQueryResultProps}
 * @returns Collapsible container wrapping a text summary
 * @group Generative AI
 * @beta
 */
export default asSisenseComponent({
  componentName: 'GetNlgQueryResult',
})(function GetNlgQueryResult(props: GetNlgQueryResultProps) {
  const { data, isLoading, isError } = useGetNlgQueryResultInternal(props);

  if (isError) {
    return <>{UNEXPECTED_ERROR}</>;
  }

  const summary = data ?? 'Oops, no data came back for that.';

  return <Collapsible text={isLoading ? 'Loading...' : summary} />;
});
