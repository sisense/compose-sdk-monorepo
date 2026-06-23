import omit from 'lodash-es/omit';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import { withTracking } from '@/infra/decorators/hook-decorators';
import type { HookEnableParam } from '@/shared/hooks/types';

import {
  useWidgetNarrativeState,
  type WidgetNarrativeQueryState,
} from './use-widget-narrative-state.js';

/**
 * Parameters for {@link useGetWidgetNarrative}.
 *
 * @remarks
 * Narrative endpoint selection uses `app.settings.narrative.canGenerateNarrativeViaAI` from
 * {@link useSisenseContext}. {@link WidgetNarrativeOptions} come from
 * `widgetProps.aiOptions.narrative` (see {@link getCompleteWidgetNarrativeOptions}).
 *
 * The `enabled` flag follows {@link HookEnableParam} (defaults to `true` when omitted).
 * @sisenseInternal
 */
export type UseGetWidgetNarrativeParams = {
  /** Widget configuration whose query drives the narrative (chart or pivot). */
  widgetProps: WidgetProps;
} & HookEnableParam;

/**
 * @sisenseInternal
 */
export type UseGetWidgetNarrativeResult = WidgetNarrativeQueryState & {
  /**
   * `true` when `widgetProps` is a chart or pivot widget and narrative params could be built
   * (including resolving `dataSource` via context `defaultDataSource` when omitted on props).
   */
  supported: boolean;
  /**
   * Effective value after applying {@link HookEnableParam} defaults (always `true` or `false`).
   * When `false`, narrative is opted out and `data` is not populated from cache.
   */
  enabled: boolean;
};

/** @internal */
function useGetWidgetNarrativeInternal(
  params: UseGetWidgetNarrativeParams,
): UseGetWidgetNarrativeResult {
  return omit(useWidgetNarrativeState(params), ['narrativeRequest']);
}

/**
 * Fetches natural-language narrative for a widget {@link WidgetProps} using the same conversion
 * path as {@link getNlgInsightsFromWidget}.
 *
 * Requires `useSisenseContext` with `app.httpClient` and a TanStack `QueryClientProvider` ancestor
 * (typically provided by `SisenseContextProvider` in full apps).
 *
 * Text and custom widgets are unsupported: `supported` is false and no request runs.
 *
 * @example Headless usage
 * ```tsx
 * const { data, isLoading, supported } = useGetWidgetNarrative({
 *   widgetProps,
 * });
 * ```
 * @sisenseInternal
 */
export const useGetWidgetNarrative = withTracking('useGetWidgetNarrative')(
  useGetWidgetNarrativeInternal,
);
