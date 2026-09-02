/**
 * Ids of the built-in widget header items, in the order they appear in the header row.
 *
 * Use these as `target`s for the `before`/`after` position of a {@link WidgetHeaderItem}.
 * A target stays valid even when its item is not currently shown (e.g. the menu button when the
 * widget has no menu items, or a spacer that currently takes no width): the position resolves as if
 * the built-in were there, so a custom item lands in a stable spot regardless of which built-ins
 * happen to be visible.
 */
export const WidgetHeaderTargets = {
  /**
   * The drag-handle icon, shown at the far left while the widget can be dragged (a dashboard in
   * edit mode). It is the widget's primary drag affordance.
   */
  DragIcon: 'widget-header-drag-icon',
  /**
   * The “Jump to Dashboard” icon, shown to the left of the title when the widget has a JTD target.
   */
  JtdIcon: 'widget-header-jtd-icon',
  /**
   * The leading spacer, before the title.
   *
   * Together with {@link WidgetHeaderTargets.Spacer} it positions the title: it takes no width when
   * the title is left-aligned, grows when the title is right-aligned, and shares the free width with
   * the trailing spacer when the title is centered.
   */
  TitleAlignmentSpacer: 'widget-header-title-alignment-spacer',
  /** The widget title. Takes its content width and ellipsizes when the header is too narrow. */
  Title: 'widget-header-title',
  /**
   * The trailing spacer, between the title and the action items — the anchor that
   * `{ type: 'auto' }` items are placed after. Grows unless the title is right-aligned.
   */
  Spacer: 'widget-header-spacer',
  /**
   * The "clear selection" button, shown while the widget has a common-filter selection to clear.
   */
  ClearSelectionButton: 'widget-header-clear-selection-button',
  /** The info ("i") button, which opens the widget's dataset/description popover. */
  InfoButton: 'widget-header-info-button',
  /** The narrative ("sparkle") button, which shows or hides the widget's generated narrative. */
  NarrativeToggle: 'widget-header-narrative-toggle',
  /** The header menu ("⋮") button. Not shown while the menu has no items. */
  Menu: 'widget-header-menu',
} as const;

/**
 * Union of the built-in widget header item ids, usable as `target` for `before`/`after` positions.
 */
export type WidgetHeaderTarget = (typeof WidgetHeaderTargets)[keyof typeof WidgetHeaderTargets];
