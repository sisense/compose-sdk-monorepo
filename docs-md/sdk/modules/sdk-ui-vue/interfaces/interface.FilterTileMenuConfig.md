---
title: FilterTileMenuConfig
---

# Interface FilterTileMenuConfig

Configuration for the filter tile menu — the menu opened from the "⋮" button in the tile header.

## Properties

### enabled

> **enabled**?: `boolean`

Whether the tile menu is enabled.

When `false`, the menu button is not rendered even if items are available — the built-in lock
item included. When enabled, the menu button is rendered as soon as there is at least one item
to show.

#### Default

```ts
true
```

***

### items

> **items**?: [`FilterTileMenuItem`](../type-aliases/type-alias.FilterTileMenuItem.md)[]

Custom items to add to the tile menu, listed after the built-in ones.

Each item's `id` must be unique within the menu and must not match the id of a built-in item —
see [FilterTileMenuTargets](../variables/variable.FilterTileMenuTargets.md).

On a cascading filter tile these items are rendered in the menu of every level of the tile,
because each level is a tile of its own.

#### Example

Add a custom item to the filter tile menu:
```ts
const filterTileConfig: FilterTileConfig = {
  header: {
    menu: {
      items: [
        {
          type: 'action',
          id: 'copy-filter-values',
          caption: 'Copy filter values',
          onClick: () => copyFilterValues(),
        },
      ],
    },
  },
};
```
