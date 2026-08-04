---
title: KpiIconName
---

# Type alias KpiIconName <Badge type="beta" text="Beta" />

> **KpiIconName**: `"arrow-down"` \| `"arrow-down-right"` \| `"arrow-right"` \| `"arrow-up"` \| `"arrow-up-right"` \| `"check"` \| `"circle"` \| `"cross"` \| `"diamond"` \| `"flag"` \| `"info"` \| `"minus"` \| `"square"` \| `"star"` \| `"triangle"` \| `"warning"`

Identifies one of the built-in icons available for KPI conditional icons -- see [KpiIcon](type-alias.KpiIcon.md).

The set follows the familiar conditional-formatting taxonomy: trend arrows, status marks,
traffic-light shapes (recolorable via the icon's `color`), and rating/flag extras.

## Example

```ts
const iconName: KpiIconName = 'arrow-up';
```
