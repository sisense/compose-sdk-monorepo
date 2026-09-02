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
- `'condition'`    — string condition builder with optional AND/OR chaining (text attributes only). Implemented.

## Example

The following selects the member-select dropdown rendering:
```ts
const filterType: FilterWidgetFilterType = 'members';
```
