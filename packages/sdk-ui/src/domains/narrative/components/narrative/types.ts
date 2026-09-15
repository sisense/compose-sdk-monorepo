/**
 * Sentiment badge shown next to a narrative insight.
 * @internal
 */
export type NarrativeInsightStatus = 'positive' | 'negative' | 'neutral';

/**
 * A single metric insight rendered as a status card below the overview.
 * @internal
 */
export type NarrativeInsight = {
  /** Sentiment classification, resolved upstream — never derived from `text`. */
  status: NarrativeInsightStatus;
  /** Insight sentence. Supports `**bold**` and nothing else. */
  text: string;
};

/**
 * Narrative payload the widget renders.
 * @remarks
 * View model owned by the UI. Anything fetched from a service is mapped into this type by a single
 * transformer, so a contract change stays confined to that transformer.
 * @internal
 */
export type NarrativeData = {
  /** Summary paragraph. Supports `**bold**` and nothing else. */
  overview: string;
  /**
   * Up to three insights. An empty list is valid and renders the overview alone — that is the
   * low-density output, not a degraded state.
   */
  readonly insights: readonly NarrativeInsight[];
  /** Generation timestamp as ISO 8601 UTC. Formatted for display using the application locale. */
  generatedAt: string;
  /**
   * Text for the copy action, formatting preserved. Assembled by the mapping — the wire shape has no
   * copy-text field — and never read by the renderer.
   */
  copyText: string;
};

/**
 * Distinguishes the failure kinds by whether another attempt could help: only `failed` offers a retry;
 * `no-data` and `quota-exceeded` show no action at all.
 * @internal
 */
export type NarrativeErrorKind = 'no-data' | 'failed' | 'quota-exceeded';

/**
 * Everything the widget can display, as mutually exclusive alternatives.
 * @internal
 */
export type NarrativeState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; data: NarrativeData }
  | { status: 'error'; kind: NarrativeErrorKind };

/**
 * Props for the dashboard narrative widget body.
 * @remarks
 * Covers the content area only. The surrounding container and header — title, three-dot menu, the copy
 * action — belong to the host widget.
 * @internal
 */
export type NarrativeProps = {
  /** What to render. */
  state: NarrativeState;
  /**
   * Set when the AI allowance is close to being used up or fully spent, which surfaces a warning
   * alongside the primary action.
   * @remarks
   * Presence alone means "show it" — the threshold belongs to the caller. Accompanies the idle and
   * ready states rather than replacing them. `exceeded` marks the allowance as fully spent, which
   * disables the regenerate action; with no narrative to keep on screen the caller uses the
   * `quota-exceeded` error kind instead.
   */
  quotaWarning?: { usagePercentage: number; exceeded?: boolean };
  /** Requests generation. Fired by the primary action wherever one is offered. */
  onGenerate?: () => void;
  /**
   * Whether the loading state draws the SDK's loading overlay. Defaults to `true`. A host that
   * supplies the widget chrome (Fusion, `containerless`) shows its own loading treatment over the
   * whole widget, so it passes `false` to avoid two indicators.
   */
  showLoadingOverlay?: boolean;
};
