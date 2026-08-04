---
title: DashboardResolvedHeaderItem
---

# Type alias DashboardResolvedHeaderItem

> **DashboardResolvedHeaderItem**: `Omit`\< [`DashboardHeaderItem`](../interfaces/interface.DashboardHeaderItem.md), `"position"` \>

A dashboard header item after the built-in and custom items have been ordered (position applied).

This is the shape passed to [DashboardHeaderConfig.onBeforeRender](../interfaces/interface.DashboardHeaderConfig.md#onbeforerender).

For custom items, `component` is the same Vue component that was registered in
[DashboardHeaderConfig.items](../interfaces/interface.DashboardHeaderConfig.md#items), so items can be matched by component identity as well as by
`id`. For built-in items, `component` is an opaque handle to an internal renderer: reorder, keep,
or remove such an item, but do not invoke or replace its component.
