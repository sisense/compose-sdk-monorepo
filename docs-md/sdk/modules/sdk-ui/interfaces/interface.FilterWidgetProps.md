---
title: FilterWidgetProps
---

# Interface FilterWidgetProps <Badge type="beta" text="Beta" />

`FilterWidgetProps` configures a filter widget — a compact, dashboard-embeddable
control that lets users filter a dashboard by selecting values for a single
dimension, without opening the full filter panel.

## Properties

### Data

#### attribute

> **attribute**: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)

Attribute (dimension) to filter on. A query fetches all members for selection.

***

#### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query runs against.

If not specified, the query will use the `defaultDataSource` specified in the
parent Sisense Context.

***

#### dimensionFilters

> **dimensionFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

The widget's own dimension filters — the permanent restriction on which members this widget
may select, as opposed to the transient dashboard state also present in `parentFilters`.

The published filter encodes them, so that selecting all values filters the dashboard by the
allowed members rather than by every member of the dimension. Pass the same filters here and
in `parentFilters`.

***

#### filter

> **filter**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md) \| `null`

Current filter state. Injected automatically when placed inside a Dashboard.
For standalone use, pass explicitly.

***

#### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Everything that narrows the member list: the widget's own dimension filters, plus any
dashboard filters the widget opted in to. Scopes the member query only.

### Widget

#### config

> **config**?: [`FilterWidgetConfig`](interface.FilterWidgetConfig.md)

Configuration of the widget.

***

#### filterType

> **filterType**?: [`FilterWidgetFilterType`](../type-aliases/type-alias.FilterWidgetFilterType.md)

How the filter is rendered. Defaults to `'members'` (searchable member-select dropdown).
`'condition'` renders a condition control for text, numeric, or datetime attributes,
`'calendar'` a calendar for datetime attributes, `'range'` a two-field From/To
date-range picker for datetime attributes, and `'period'` a Time Frame dropdown —
a one-click list of ready-made relative windows (Today, Last 7 days, This month, …)
for datetime attributes.
Additional types will be added as they are implemented.

##### Default Value

```ts
'members'
```

***

#### isMultiselect

> **isMultiselect**?: `boolean`

If true, the dropdown allows selecting multiple members.

##### Default Value

```ts
true
```

***

#### styleOptions

> **styleOptions**?: [`FilterWidgetStyleOptions`](../type-aliases/type-alias.FilterWidgetStyleOptions.md)

Style options for the widget container (look & feel, border, shadow, etc.), and for the
filter control inside it under `control`.

***

#### timeFrames <Badge type="beta" text="Beta" />

> **timeFrames**?: `string`[]

The frames a `'period'` (Time Frame) filter offers, given as an array of canonical
frame keys (`tense:count:grain[:c]`, e.g. `'last:7:Day'`, `'last:2:Month:c'`).

When omitted, the filter offers the default 11: Today · Yesterday · This week ·
Last week · This month · Last month · Last 6 months · This quarter · Last quarter ·
This year · Last year — the common set for a fresh widget.

A key not in the 47-frame catalogue is dropped on read, and a set of fewer than two
valid keys reads as the default 11 — a defensive guard so a saved dashboard can
never present an unusable list. Order is canonical (Days → Weeks → Months →
Quarters → Years, and within each grain the row order of the catalogue), not the
caller's order.

Ignored for every filter type other than `'period'`.

***

#### title

> **title**?: `string`

Widget title. Auto-populated from `attribute.name` if not set.
