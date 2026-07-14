---
title: FilterWidgetFilterType
---

# Type alias FilterWidgetFilterType <Badge type="beta" text="Beta" />

> **FilterWidgetFilterType**: `"condition"` \| `"dateRange"` \| `"members"` \| `"numericRange"` \| `"period"`

Rendering type for the FilterWidget.

- `'members'`      — searchable member-select dropdown. Implemented.
- `'dateRange'`    — date-range picker. Planned.
- `'period'`       — relative-period picker. Planned.
- `'numericRange'` — numeric range slider. Planned.
- `'condition'`    — conditional / formula filter builder. Planned.

## Example

```ts
<FilterWidget attribute={DM.Commerce.Country} filterType="members" />
```
