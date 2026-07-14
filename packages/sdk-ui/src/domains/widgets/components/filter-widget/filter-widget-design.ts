/**
 * Single source of truth for the visual parameters of the FilterWidget's
 * 'members' (List) filter type UI.
 *
 * Every dimension variant (text, numeric, datetime — including the two-dropdown
 * datetime layout) must take its box metrics from this object so the widget
 * renders with identical width, padding and typography regardless of the
 * selected dimension type. A future widget-editor Design panel is expected to
 * manage these values (border, shadow, padding, etc.) — likely per filter
 * type — so keep every visual knob here rather than inline in the components.
 * @internal
 */
export const membersFilterWidgetDesign = {
  /** Overall component width in px — identical for all dimension variants. */
  width: 350,
  /** Inner padding between the component edge and every row (label, selectors). */
  padding: {
    top: 6,
    right: 8,
    bottom: 8,
    left: 8,
  },
  /** Vertical gap between the label row and the selector row. */
  rowGap: 4,
  /** Dimension label above the selector row. */
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  /** Datetime variant: granularity dropdown (left) + value dropdown (right). */
  dateRow: {
    /** Gap between the two dropdowns. */
    gap: 8,
    /** Fixed width of the value dropdown; the granularity dropdown takes the rest. */
    valueWidth: 150,
  },
  /** "Select a dimension" placeholder shown before a dimension is configured. */
  placeholder: {
    color: '#aaa',
    fontSize: 13,
  },
} as const;
