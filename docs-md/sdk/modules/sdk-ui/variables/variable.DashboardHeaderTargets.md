---
title: DashboardHeaderTargets
---

# Variable DashboardHeaderTargets

> **`const`** **DashboardHeaderTargets**: `object`

Ids of the built-in dashboard header items.

Use these as `target`s for the `before`/`after` position of a [DashboardHeaderItem](../interfaces/interface.DashboardHeaderItem.md).
A target stays valid even when it is not currently shown (e.g. the filter toggle when
its icon is disabled): the position resolves as if the built-in were there, so the custom item lands
in a stable spot regardless of which built-ins happen to be visible.

## Type declaration

### `EditModeToolbar`

**`readonly`** **EditModeToolbar**: `"dashboard-header-edit-mode-toolbar"` = `'dashboard-header-edit-mode-toolbar'`

The edit-mode toolbar (undo/redo/cancel/apply), shown while editing with batch changes.

***

### `EditToggle`

**`readonly`** **EditToggle**: `"dashboard-header-edit-toggle"` = `'dashboard-header-edit-toggle'`

The edit-mode toggle button.

***

### `FilterToggle`

**`readonly`** **FilterToggle**: `"dashboard-header-filter-toggle"` = `'dashboard-header-filter-toggle'`

The filters-panel toggle button.

***

### `Menu`

**`readonly`** **Menu**: `"dashboard-header-menu"` = `'dashboard-header-menu'`

The overflow/context menu button.

***

### `Spacer`

**`readonly`** **Spacer**: `"dashboard-header-spacer"` = `'dashboard-header-spacer'`

The flexible center spacer that separates the title and trailing groups.

***

### `Title`

**`readonly`** **Title**: `"dashboard-header-title"` = `'dashboard-header-title'`

The dashboard title.
