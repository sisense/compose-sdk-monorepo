---
title: FilterWidgetFilterType
---

# Type alias FilterWidgetFilterType <Badge type="beta" text="Beta" />

> **FilterWidgetFilterType**: `"condition"` \| `"dateRange"` \| `"members"` \| `"numericRange"` \| `"period"`

`FilterWidgetFilterType` selects the rendering type for a filter widget.

- `'members'`      — searchable member-select dropdown. Implemented.
- `'dateRange'`    — date-range picker. Planned.
- `'period'`       — relative-period picker. Planned.
- `'numericRange'` — numeric range slider. Planned.
- `'condition'`    — conditional / formula filter builder. Planned.

## Example

The following selects the member-select dropdown rendering:
```ts
const filterType: FilterWidgetFilterType = 'members';
```
