---
title: DashboardHeaderConfig
---

# Interface DashboardHeaderConfig

Configuration for the dashboard header items.

## Properties

### items

> **items**?: [`DashboardHeaderItem`](interface.DashboardHeaderItem.md)[]

Custom items to inject into the header.

Each item's `id` must not match a built-in item id (see [DashboardHeaderTargets](../variables/variable.DashboardHeaderTargets.md)).

***

### onBeforeRender

> **onBeforeRender**?: [`DashboardHeaderItemsTransform`](../type-aliases/type-alias.DashboardHeaderItemsTransform.md)

Advanced callback to inspect and rewrite the full, ordered list of header items (built-in +
custom) right before rendering. The only way to modify or remove built-in items.

***

### visible

> **visible**?: `boolean`

Boolean flag that determines whether the dashboard header is visible.

If not specified, the default value is `true`.
