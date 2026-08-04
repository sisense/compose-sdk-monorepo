---
title: DashboardHeaderItemPosition
---

# Type alias DashboardHeaderItemPosition

> **DashboardHeaderItemPosition**: \{
  `type`: `"auto"`;
 } \| \{
  `target`: [`DashboardHeaderTarget`](type-alias.DashboardHeaderTarget.md) \| `string`;
  `type`: `"before"`;
 } \| \{
  `target`: [`DashboardHeaderTarget`](type-alias.DashboardHeaderTarget.md) \| `string`;
  `type`: `"after"`;
 } \| \{
  `type`: `"first"`;
 } \| \{
  `type`: `"last"`;
 }

Position of a custom dashboard header item relative to the other items.

- `auto` (default) — automatic placement.
- `before` / `after` — placed immediately before/after the item with the given `target` id.
  Pass a [DashboardHeaderTargets](../variables/variable.DashboardHeaderTargets.md) constant to anchor to a built-in item (works even when
  that built-in is currently hidden), or any custom item id to anchor to another injected item.
- `first` / `last` — placed at the very start/end of the header.
