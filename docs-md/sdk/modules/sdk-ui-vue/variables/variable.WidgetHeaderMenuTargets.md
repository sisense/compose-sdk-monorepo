---
title: WidgetHeaderMenuTargets
---

# Variable WidgetHeaderMenuTargets

> **`const`** **WidgetHeaderMenuTargets**: `object`

Ids of the built-in widget header menu items.

Built-in items are contributed by the widget itself when the corresponding feature is enabled
(renaming, duplication, export, …) and are always listed before custom items. Their ids are
reserved: the `id` of a custom [WidgetHeaderMenuItem](../type-aliases/type-alias.WidgetHeaderMenuItem.md) must not match any of them.

## Type declaration

### `DeleteWidget`

**`readonly`** **DeleteWidget**: `"widget-header-menu-delete-widget"`

The "Delete widget" menu item.

***

### `DistributeEqualWidth`

**`readonly`** **DistributeEqualWidth**: `"widget-header-menu-layout-equal-width"`

The "Distribute equal width" menu item.

***

### `Download`

**`readonly`** **Download**: `"widget-header-menu-download"`

The "Download" menu group.

***

### `DownloadCsv`

**`readonly`** **DownloadCsv**: `"widget-header-menu-download-csv"`

The "Download > CSV File" menu item.

***

### `DownloadExcel`

**`readonly`** **DownloadExcel**: `"widget-header-menu-download-excel"`

The "Download > Excel File" menu item.

***

### `DownloadExcelMergeRows`

**`readonly`** **DownloadExcelMergeRows**: `"widget-header-menu-download-excel-merge-rows"`

The "Download > Excel File > Merge rows" menu item.

***

### `DownloadExcelRepeatRows`

**`readonly`** **DownloadExcelRepeatRows**: `"widget-header-menu-download-excel-repeat-rows"`

The "Download > Excel File > Repeat rows" menu item.

***

### `DuplicateWidget`

**`readonly`** **DuplicateWidget**: `"widget-header-menu-duplicate-widget"`

The "Duplicate widget" menu item.

***

### `RenameWidget`

**`readonly`** **RenameWidget**: `"widget-header-menu-rename-widget"`

The "Rename widget" menu item.
