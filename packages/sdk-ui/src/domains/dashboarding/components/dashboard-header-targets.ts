/**
 * Ids of the built-in dashboard header items.
 *
 * Use these as `target`s for the `before`/`after` position of a {@link DashboardHeaderItem}.
 * A target stays valid even when it is not currently shown (e.g. the filter toggle when
 * its icon is disabled): the position resolves as if the built-in were there, so the custom item lands
 * in a stable spot regardless of which built-ins happen to be visible.
 *
 * @alpha
 */
export const DashboardHeaderTargets = {
  /** The dashboard title. */
  Title: 'dashboard-header-title',
  /** The flexible center spacer that separates the title and trailing groups. */
  Spacer: 'dashboard-header-spacer',
  /** The edit-mode toolbar (undo/redo/cancel/apply), shown while editing with batch changes. */
  EditModeToolbar: 'dashboard-header-edit-mode-toolbar',
  /** The edit-mode toggle button. */
  EditToggle: 'dashboard-header-edit-toggle',
  /** The filters-panel toggle button. */
  FilterToggle: 'dashboard-header-filter-toggle',
  /** The overflow/context menu button. */
  Menu: 'dashboard-header-menu',
} as const;

/**
 * Union of the built-in dashboard header item ids, usable as `target` for `before`/`after` positions.
 *
 * @alpha
 */
export type DashboardHeaderTarget =
  (typeof DashboardHeaderTargets)[keyof typeof DashboardHeaderTargets];
