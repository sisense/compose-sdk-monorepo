import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
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
 * React component that fetches and displays a collapsible analysis of the provided JAQL using natural language generation (NLG).
 *
 * This takes the same props as {@link useGetNlgQueryResult} and makes the same API call but presents the result in a collapsible container.
 *
 * ::: warning Note
 * This component is currently under private beta for selected customers and is subject to change as we make fixes and improvements.
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
 * @beta
 */
export default asSisenseComponent({
  componentName: 'GetNlgQueryResult',
})(function GetNlgQueryResult(props: GetNlgQueryResultProps) {
  const { data, isLoading } = useGetNlgQueryResultInternal(props);

  const summary = data ?? 'Oops, no data came back for that.';

  return <Collapsible text={isLoading ? 'Loading...' : summary} />;
});
