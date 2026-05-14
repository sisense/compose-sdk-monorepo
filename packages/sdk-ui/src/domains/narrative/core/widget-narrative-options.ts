import type { DataSource } from '@sisense/sdk-data';

/**
 * Options shared by {@link useGetWidgetNarrative} and imperative helpers such as
 * {@link getNlgInsightsFromWidget}.
 *
 * @internal
 */
export interface WidgetNarrativeOptions {
  /** Optional default data source to use if WidgetProps.dataSource is undefined */
  defaultDataSource?: DataSource;
  /** The verbosity of the NLG summarization */
  verbosity?: 'Low' | 'High';
  /**
   * When `true`, attempts the unified AI narrative endpoint and falls back to the legacy endpoint
   * on 404. When `false` or omitted, only the legacy endpoint is used.
   *
   * **Hook-based flows** (e.g. {@link useGetWidgetNarrative}): when omitted, the value is read
   * from `app.settings.narrative.canGenerateNarrativeViaAI` via {@link useSisenseContext}.
   *
   * **Imperative helpers** (e.g. {@link getNlgInsightsFromWidget}): no context fallback is
   * performed — omitting this option is equivalent to `false` (legacy endpoint only).
   */
  canGenerateNarrativeViaAI?: boolean;
  /**
   * When `true`, trend and forecast companion measures are omitted from the narrative JAQL so
   * requests stay compatible with backends that do not yet support them.
   *
   * @default false
   */
  ignoreTrendAndForecast?: boolean;
}

/**
 * @deprecated Use {@link WidgetNarrativeOptions}. Same shape; kept for legacy naming.
 * @internal
 */
export type WidgetNarrativeNlgOptions = WidgetNarrativeOptions;
