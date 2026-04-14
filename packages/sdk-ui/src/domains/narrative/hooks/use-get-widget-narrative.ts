import omit from 'lodash-es/omit';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import { withTracking } from '@/infra/decorators/hook-decorators';

import type { WidgetNarrativeOptions } from '../core/widget-narrative-options.js';
import {
  useWidgetNarrativeState,
  type WidgetNarrativeQueryState,
} from './use-widget-narrative-state.js';

/**
 * Options for {@link useGetWidgetNarrative}.
 *
 * @remarks
 * Narration endpoints and flags default from `app.settings` on {@link useSisenseContext} when
 * `isUnifiedNarrationEnabled` / `isSisenseAiEnabled` are omitted. Optional overrides match the
 * imperative `getNlgInsightsFromWidget` helper for per-call behavior.
 * @sisenseInternal
 */
export type UseGetWidgetNarrativeOptions = WidgetNarrativeOptions & {
  /**
   * When `false`, skips the narrative request.
   *
   * @default true
   */
  enabled?: boolean;
};

/**
 * @sisenseInternal
 */
export type UseGetWidgetNarrativeParams = {
  /** Widget configuration whose query drives the narrative (chart or pivot). */
  widgetProps: WidgetProps;
} & UseGetWidgetNarrativeOptions;

/**
 * @sisenseInternal
 */
export type UseGetWidgetNarrativeResult = WidgetNarrativeQueryState & {
  /**
   * `true` when `widgetProps` is a chart or pivot widget and narrative params could be built
   * (including resolving `dataSource` via `defaultDataSource`).
   */
  supported: boolean;
  /**
   * Mirrors {@link UseGetWidgetNarrativeOptions.enabled}. When `false`, narrative is opted out and
   * `data` is not populated from cache.
   */
  enabled: boolean;
};

/** @internal */
function useGetWidgetNarrativeWithoutTracking(
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
 *   defaultDataSource: DM.DataSource,
 *   verbosity: 'Low',
 * });
 * ```
 * @sisenseInternal
 */
export const useGetWidgetNarrative = withTracking('useGetWidgetNarrative')(
  useGetWidgetNarrativeWithoutTracking,
);
