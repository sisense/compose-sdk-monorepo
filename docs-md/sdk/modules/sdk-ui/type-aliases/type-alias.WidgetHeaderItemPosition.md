---
title: WidgetHeaderItemPosition
---

# Type alias WidgetHeaderItemPosition

> **WidgetHeaderItemPosition**: \{
  `type`: `"auto"`;
 } \| \{
  `target`: [`WidgetHeaderTarget`](type-alias.WidgetHeaderTarget.md) \| `string`;
  `type`: `"before"`;
 } \| \{
  `target`: [`WidgetHeaderTarget`](type-alias.WidgetHeaderTarget.md) \| `string`;
  `type`: `"after"`;
 } \| \{
  `type`: `"first"`;
 } \| \{
  `type`: `"last"`;
 }

Position of a custom widget header item relative to the other items.

- `auto` (default) — placed at the start of the trailing group, right after the trailing spacer.
- `before` / `after` — placed immediately before/after the item with the given `target` id.
  Pass a [WidgetHeaderTargets](../variables/variable.WidgetHeaderTargets.md) constant to anchor to a built-in item (works even when that
  built-in is currently hidden), or any custom item id to anchor to another injected item.
- `first` / `last` — placed at the very start/end of the header.
