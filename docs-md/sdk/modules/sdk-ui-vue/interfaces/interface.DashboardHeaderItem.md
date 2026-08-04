---
title: DashboardHeaderItem
---

# Interface DashboardHeaderItem

A custom item to inject into the dashboard header.

## Properties

### component

> **component**: [`DashboardHeaderItemComponent`](../type-aliases/type-alias.DashboardHeaderItemComponent.md)

Vue component that renders the content of the item.

***

### id

> **id**: `string`

Unique identifier of the item.

Must not match a built-in dashboard header item id (see [DashboardHeaderTargets](../variables/variable.DashboardHeaderTargets.md)).

***

### position

> **position**?: [`DashboardHeaderItemPosition`](../type-aliases/type-alias.DashboardHeaderItemPosition.md)

Placement of the item.

Defaults to `{ type: 'auto' }` (after the center spacer).

***

### size

> **size**?: [`DashboardHeaderItemSize`](interface.DashboardHeaderItemSize.md)

Size of the item.
