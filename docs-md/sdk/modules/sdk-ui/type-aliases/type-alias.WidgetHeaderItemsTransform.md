---
title: WidgetHeaderItemsTransform
---

# Type alias WidgetHeaderItemsTransform

> **WidgetHeaderItemsTransform**: (`items`) => [`WidgetResolvedHeaderItem`](type-alias.WidgetResolvedHeaderItem.md)[]

Transforms the fully ordered list of widget header items right before rendering.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `items` | `ReadonlyArray`\< [`WidgetResolvedHeaderItem`](type-alias.WidgetResolvedHeaderItem.md) \> | The fully ordered list of header items (built-in + custom), immediately before rendering. |

## Returns

[`WidgetResolvedHeaderItem`](type-alias.WidgetResolvedHeaderItem.md)[]

The list of header items to render.
