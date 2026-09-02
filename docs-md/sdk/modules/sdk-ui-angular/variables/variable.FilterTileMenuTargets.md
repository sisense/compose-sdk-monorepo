---
title: FilterTileMenuTargets
---

# Variable FilterTileMenuTargets

> **`const`** **FilterTileMenuTargets**: `object`

Ids of the built-in filter tile menu items.

Built-in items are contributed by the tile itself when the corresponding feature is enabled and
are always listed before custom items. Their ids are reserved: the `id` of a custom
[FilterTileMenuItem](../type-aliases/type-alias.FilterTileMenuItem.md) must not match any of them.

## Type declaration

### `Lock`

**`readonly`** **Lock**: `"filter-tile-menu-lock"`

The "Lock"/"Unlock" menu item.

A cascading filter tile uses this same id for its "Lock Group"/"Unlock Group" item — the two
are never present in the same menu, since a tile is either cascading or it is not.
