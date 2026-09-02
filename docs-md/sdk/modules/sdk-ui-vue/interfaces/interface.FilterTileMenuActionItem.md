---
title: FilterTileMenuActionItem
---

# Interface FilterTileMenuActionItem

A filter tile menu item that runs an action when clicked.

## Properties

### caption

> **caption**: `string`

Text of the item, as shown in the menu.

***

### id

> **id**: `string`

Unique identifier of the item within the menu.

Must not match the id of a built-in item — see [FilterTileMenuTargets](../variables/variable.FilterTileMenuTargets.md).

***

### onClick

> **onClick**: () => `void`

Callback invoked when the item is clicked.

#### Returns

`void`

***

### type

> **type**: `"action"`

Kind of the item.
