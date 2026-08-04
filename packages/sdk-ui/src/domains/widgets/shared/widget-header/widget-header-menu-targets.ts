/**
 * Ids of the built-in widget header menu items.
 *
 * Built-in items are contributed by the widget itself when the corresponding feature is enabled
 * (renaming, duplication, export, …) and are always listed before custom items. Their ids are
 * reserved: the `id` of a custom {@link WidgetHeaderMenuItem} must not match any of them.
 */
export const WidgetHeaderMenuTargets = {
  /** The "Rename widget" menu item. */
  RenameWidget: 'widget-header-menu-rename-widget',
  /** The "Duplicate widget" menu item. */
  DuplicateWidget: 'widget-header-menu-duplicate-widget',
  /** The "Delete widget" menu item. */
  DeleteWidget: 'widget-header-menu-delete-widget',
  /** The "Distribute equal width" menu item. */
  DistributeEqualWidth: 'widget-header-menu-layout-equal-width',
  /** The "Download" menu group. */
  Download: 'widget-header-menu-download',
  /** The "Download > CSV File" menu item. */
  DownloadCsv: 'widget-header-menu-download-csv',
  /** The "Download > Excel File" menu item. */
  DownloadExcel: 'widget-header-menu-download-excel',
  /** The "Download > Excel File > Repeat rows" menu item. */
  DownloadExcelRepeatRows: 'widget-header-menu-download-excel-repeat-rows',
  /** The "Download > Excel File > Merge rows" menu item. */
  DownloadExcelMergeRows: 'widget-header-menu-download-excel-merge-rows',
} as const;

/**
 * Union of the built-in widget header menu item ids.
 */
export type WidgetHeaderMenuTarget =
  (typeof WidgetHeaderMenuTargets)[keyof typeof WidgetHeaderMenuTargets];
