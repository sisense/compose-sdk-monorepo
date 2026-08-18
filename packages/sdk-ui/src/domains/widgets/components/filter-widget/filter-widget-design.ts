/**
 * Defines visual parameters shared across FilterWidget filter types.
 * @internal
 */
export const filterWidgetDesign = {
  /** Empty state shown before a dimension is configured (editor / new widget). */
  noDimPlaceholder: {
    color: '#666666',
    title: {
      fontSize: 30,
      fontWeight: 600,
      lineHeight: '36px',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: '24px',
      letterSpacing: '0px',
    },
    gapTitleToSubtitle: 8,
    gapSubtitleToImage: 24,
    imageMaxWidth: 480,
  },
} as const;

/**
 * Defines visual parameters for the FilterWidget's
 * 'members' (List) filter type UI.
 *
 * Every dimension variant (text, numeric, datetime — including the two-dropdown
 * datetime layout) must take its box metrics from this object so the widget
 * renders with identical padding and typography regardless of the selected
 * dimension type. Dropdowns fill the container width; the container itself
 * clamps between `minWidth` and `maxWidth`. A future widget-editor Design
 * panel is expected to manage these values (border, shadow, padding, etc.) —
 * likely per filter type — so keep every visual knob here rather than inline
 * in the components.
 * @internal
 */
export const membersFilterWidgetDesign = {
  /** Defines the minimum container width in px for all dimension variants. */
  minWidth: 200,
  /** Defines the maximum container width in px for all dimension variants. */
  maxWidth: 400,
  /** Inner padding between the component edge and every row (label, selectors). */
  padding: {
    top: 6,
    right: 8,
    bottom: 8,
    left: 8,
  },
  /** Datetime variant: granularity dropdown (left) + value dropdown (right). */
  dateRow: {
    /** Gap between the two dropdowns. */
    gap: 8,
  },
  /** Placeholder text shown in the select trigger when no members are selected. */
  placeholder: {
    color: '#666666',
  },
  /** Styles applied to the trigger field (closed state) of every select dropdown. */
  selectField: {
    background: '#ffffff',
    border: '1px solid #d0d0d0',
  },
} as const;
