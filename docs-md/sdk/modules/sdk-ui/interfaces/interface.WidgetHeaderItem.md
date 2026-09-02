---
title: WidgetHeaderItem
---

# Interface WidgetHeaderItem

A custom item to inject into the widget header.

## Properties

### component

> **component**: [`WidgetHeaderItemComponent`](../type-aliases/type-alias.WidgetHeaderItemComponent.md)

Component that renders the content of the item.

***

### id

> **id**: `string`

Unique identifier of the item.

Must not match a built-in widget header item id (see [WidgetHeaderTargets](../variables/variable.WidgetHeaderTargets.md)).

***

### position

> **position**?: [`WidgetHeaderItemPosition`](../type-aliases/type-alias.WidgetHeaderItemPosition.md)

Placement of the item.

Defaults to `{ type: 'auto' }` (the start of the trailing group, after the trailing spacer).

***

### size

> **size**?: [`WidgetHeaderItemSize`](interface.WidgetHeaderItemSize.md)

Size of the item.
