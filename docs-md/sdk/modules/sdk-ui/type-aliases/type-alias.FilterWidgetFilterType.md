---
title: FilterWidgetFilterType
---

# Type alias FilterWidgetFilterType <Badge type="beta" text="Beta" />

> **FilterWidgetFilterType**: `"calendar"` \| `"condition"` \| `"members"` \| `"period"` \| `"range"`

`FilterWidgetFilterType` selects the rendering type for a filter widget.

- `'members'`      — searchable member-select dropdown. Implemented.
- `'calendar'`     — calendar taking one date or several, for datetime attributes only. Implemented.
- `'range'`        — range picker for date (From/To fields with a shared calendar) and numeric (Minimum / Maximum fields with a slider) attributes. Implemented.
- `'period'`       — Time Frame: one-click list of ready-made relative windows (Today,
                    Last 7 days, This month, …) for datetime attributes only. Implemented.
- `'condition'`    — condition builder for text (with optional AND/OR chaining), numeric, and date attributes. Implemented.

## Example

The following selects the member-select dropdown rendering:
```ts
const filterType: FilterWidgetFilterType = 'members';
```
