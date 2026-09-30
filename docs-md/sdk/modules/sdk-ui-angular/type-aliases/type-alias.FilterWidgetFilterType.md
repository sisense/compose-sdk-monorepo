---
title: FilterWidgetFilterType
---

# Type alias FilterWidgetFilterType <Badge type="beta" text="Beta" />

> **FilterWidgetFilterType**: `"calendar"` \| `"condition"` \| `"members"` \| `"numericRange"` \| `"period"` \| `"range"`

`FilterWidgetFilterType` selects the rendering type for a filter widget.

- `'members'`      — searchable member-select dropdown. Implemented.
- `'calendar'`     — calendar taking one date or several, for datetime attributes only. Implemented.
- `'range'`        — two-field From/To date-range picker, for datetime attributes only. Implemented.
- `'period'`       — relative-period picker. Planned.
- `'numericRange'` — numeric range slider. Planned.
- `'condition'`    — condition builder for text (with optional AND/OR chaining), numeric, and date attributes. Implemented.

## Example

The following selects the member-select dropdown rendering:
```ts
const filterType: FilterWidgetFilterType = 'members';
```
