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
  /** When false, legacy narration endpoint only; when true or undefined, try unified then fallback. */
  isUnifiedNarrationEnabled?: boolean;
  isSisenseAiEnabled?: boolean;
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
