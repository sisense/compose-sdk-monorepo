/**
 * Narrow, props-shaped slice of widget state that can be persisted through the
 * unified `DashboardPersistenceManager.updateWidget` channel. Intentionally
 * narrow on first landing — extended only when a new field is paired with a
 * row in the persist middleware's per-field DTO patch table AND an
 * update→DTO-patch→re-read roundtrip test.
 *
 * For the persistable-vs-transient distinction, see
 * [unified-widget-updates-persistence.md §6.4](./__dev-docs__/unified-widget-updates-persistence.md).
 * Transient/interactive events (drilldown selections, in-progress title edits)
 * stay on the {@link WidgetChangeEvent} channel.
 *
 * @sisenseInternal
 */
export type WidgetPropsUpdate = {
  /**
   * Persists the widget title via the per-field DTO patch table
   * (`title → dto.title`); used by inline widget renaming.
   */
  readonly title?: string;
  readonly styleOptions?: {
    readonly navigator?: {
      readonly scrollerLocation?: { readonly min: number; readonly max: number };
    };
    readonly columns?: {
      readonly widths?: ReadonlyArray<number>;
    };
    /**
     * For custom (plugin) widgets, `styleOptions` is an opaque deeply-partial
     * bag — arbitrary keys are deep-merged into the widget's opaque DTO
     * `style` (see `deepMerge` for the semantics). Chart widgets only use the
     * typed `navigator` subtree above.
     */
    readonly [key: string]: unknown;
  };
  /**
   * Custom-widget-specific runtime options to persist. Only meaningful for
   * custom (plugin) widgets. The middleware deep-merges this into the widget
   * DTO's `customOptions` bag, preserving any existing keys (at any depth) not
   * present in the update.
   *
   * Only serializable values should be passed — non-serializable values cannot
   * survive the DTO round-trip.
   */
  readonly customOptions?: Readonly<Record<string, unknown>>;
};

/**
 * Callback signature used internally by `useWidgetUpdatesPersistence` to emit
 * a persistable update for a specific widget. Not part of the public
 * `WidgetProps` surface — composition layer injects handlers into the
 * visualization's existing callback APIs (e.g.
 * `styleOptions.navigator.onScrollerChange`, `styleOptions.columns.onColumnsResize`).
 *
 * @internal
 */
export type OnWidgetUpdate = (update: WidgetPropsUpdate) => void;
