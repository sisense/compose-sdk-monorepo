import { useGetNlgQueryResult } from './api/hooks';
import { InsightsSummary } from './messages/insights-message';

/**
 * Props for {@link NlgQueryResult} component.
 *
 * @internal
 */
export type NlgQueryResultProps = {
  /** The data source that the JAQL metadata targets - e.g. `Sample ECommerce` */
  dataSource: string;

  /** The metadata that composes the JAQL to be analyzed */
  metadata: unknown[];
};

/**
 * Fetch and display a collapsible analysis of the provided JAQL.
 *
 * @param props - {@link NlgQueryResultProps}
 * @returns A response object containing a text summary
 * @internal
 */
export default function NlgQueryResult(props: NlgQueryResultProps) {
  const { data, isLoading } = useGetNlgQueryResult(props);

  const summary = data ?? 'Oops, no data came back for that.';

  return <InsightsSummary summary={isLoading ? 'Loading...' : summary} />;
}
