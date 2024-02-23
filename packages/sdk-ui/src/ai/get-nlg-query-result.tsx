import { asSisenseComponent } from '@/decorators/component-decorators/as-sisense-component';
import { GetNlgQueryResultRequest } from './api/types';
import { InsightsSummary } from './messages/insights-message';
import { useGetNlgQueryResultInternal } from './use-get-nlg-query-result';

/**
 * Props for {@link GetNlgQueryResult} component.
 */
export type GetNlgQueryResultProps = GetNlgQueryResultRequest;

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
 * import { SisenseContextProvider } from '@sisense/sdk-ui';
 * import { AiContextProvider, GetNlgQueryResult } from '@sisense/sdk-ui/ai';
 *
 * function Page() {
 *   return (
 *     <GetNlgQueryResult
 *       jaql={{
 *         datasource: { title: 'Sample ECommerce' },
 *         metadata: [
 *           {
 *             jaql: {
 *               column: 'Date',
 *               datatype: 'datetime',
 *               dim: '[Commerce.Date]',
 *               firstday: 'mon',
 *               level: 'years',
 *               table: 'Commerce',
 *               title: 'Date',
 *             },
 *           },
 *           {
 *             jaql: {
 *               agg: 'sum',
 *               column: 'Revenue',
 *               datatype: 'numeric',
 *               dim: '[Commerce.Revenue]',
 *               table: 'Commerce',
 *               title: 'total of Revenue',
 *             },
 *           },
 *         ],
 *       }}
 *       style="Large"
 *     />
 *   );
 * }
 *
 * function App() {
 *   return (
 *     <SisenseContextProvider {...sisenseContextProps}>
 *       <AiContextProvider>
 *         <Page />
 *       </AiContextProvider>
 *     </SisenseContextProvider>
 *   );
 * }
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

  return <InsightsSummary summary={isLoading ? 'Loading...' : summary} />;
});
