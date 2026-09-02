---
title: FilterTileMenuSubmenuItem
---

# Interface FilterTileMenuSubmenuItem

A filter tile menu item that opens a nested submenu when clicked.

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

### items

> **items**: [`FilterTileMenuItem`](../type-aliases/type-alias.FilterTileMenuItem.md)[]

Items of the nested submenu. Submenus may be nested further.

A submenu with no items is not rendered.

***

### type

> **type**: `"submenu"`

Kind of the item.
