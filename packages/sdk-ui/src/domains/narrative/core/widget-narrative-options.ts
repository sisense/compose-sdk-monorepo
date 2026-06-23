/**
 * Location where the narrative is displayed in the widget.
 *
 * - `above`: displayed above the widget
 * - `below`: displayed below the widget
 * - `alone`: displayed alone, without any other widget content
 *
 * @default 'above'
 * @alpha
 */
export type WidgetNarrativeDisplayLocation = 'above' | 'below' | 'alone';

/**
 * Narrative configuration options for widgets.
 *
 * @alpha
 */
export type WidgetNarrativeOptions = {
  /**
   * Verbosity for narrative generation.
   *
   * @default low
   */
  verbosity?: 'low' | 'high';
  /**
   * When `true`, any trend and forecast companion measures present on the widget are included in the narrative request.
   *
   * When `false`, they are not included in the narrative request.
   *
   * @default true
   */
  includeTrendAndForecast?: boolean;
  /**
   * When `true`, narrative is enabled for the widget.
   *
   * When `false`, narrative is disabled for the widget and will not be generated.
   *
   * @default false
   */
  enabled?: boolean;
  /**
   * Location where the narrative is displayed in the widget. See {@link WidgetNarrativeDisplayLocation} for more details.
   *
   * @default 'above'
   */
  displayLocation?: WidgetNarrativeDisplayLocation;
  /**
   * Whether the narrative auto-shows on load without user interaction.
   *
   * When `true`, narrative is requested and displayed as soon as the widget loads.
   *
   * When `false`, narrative is requested and displayed only after user interaction.
   *
   * @default true (for backwards compatibility with older narrative settings in Fusion widgets)
   */
  autoShow?: boolean;
  /**
   * Settings for interactive AI feedback icons.
   */
  feedback?: {
    /**
     * Whether the interactive AI feedback icons are enabled.
     *
     * When `true`, the interactive AI feedback icons are shown.
     *
     * When `false`, the interactive AI feedback icons are not shown.
     *
     * @default false
     */
    enabled?: boolean;
  };
  /**
   * Maximum fraction of the content area height the narrative area may occupy.
   *
   * The content area is the space below the widget header — i.e. the area previously occupied
   * by the chart alone. `heightFraction = 0.5` therefore means the narrative receives half the space that
   * was available to the chart.
   *
   * Accepts a value in the range `0`–`1`.
   * - `undefined` (default): narrative takes whatever vertical space it needs; the chart fills the rest.
   * - `0.3`: narrative is capped at 30 % of the content area; the chart always receives the remaining 70 %.
   *
   * Practical guidelines:
   * - Values above `~0.8` leave very little room for the chart.
   * - Values below `~0.1` may clip the collapsed narrative text (~46 px).
   * - Has no effect when {@link WidgetNarrativeOptions.displayLocation | displayLocation} is `'alone'`
   *   (the chart is already hidden in that mode).
   */
  heightFraction?: number;
};

/**
 * {@link WidgetNarrativeOptions} with all optional fields filled using {@link getCompleteWidgetNarrativeOptions}.
 *
 * @alpha
 */
export type CompleteWidgetNarrativeOptions = {
  enabled: boolean;
  verbosity: 'low' | 'high';
  displayLocation: WidgetNarrativeDisplayLocation;
  autoShow: boolean;
  includeTrendAndForecast: boolean;
  feedback: {
    enabled: boolean;
  };
  /** Resolved from {@link WidgetNarrativeOptions.heightFraction}. `undefined` means no constraint. */
  heightFraction: number | undefined;
};

function normalizeNarrativeHeight(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  if (value < 0 || value > 1) {
    console.error(
      `[WidgetNarrative] heightFraction must be in the range [0, 1], got ${value}. The value will be ignored.`,
    );
    return undefined;
  }
  return value;
}

/**
 * Returns {@link WidgetNarrativeOptions} with defaults applied for runtime.
 *
 * @param narrative - Optional narrative configuration to apply defaults to
 * @returns Complete narrative configuration with defaults applied
 * @alpha
 */
export function getCompleteWidgetNarrativeOptions(
  narrative?: WidgetNarrativeOptions,
): CompleteWidgetNarrativeOptions {
  return {
    enabled: narrative?.enabled ?? false,
    verbosity: narrative?.verbosity ?? 'low',
    displayLocation: narrative?.displayLocation ?? 'above',
    autoShow: narrative?.autoShow ?? true,
    includeTrendAndForecast: narrative?.includeTrendAndForecast ?? true,
    feedback: {
      enabled: narrative?.feedback?.enabled ?? false,
    },
    heightFraction: normalizeNarrativeHeight(narrative?.heightFraction),
  };
}
