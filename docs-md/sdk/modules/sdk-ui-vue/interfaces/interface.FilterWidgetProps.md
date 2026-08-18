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

#### filter

> **filter**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md) \| `null`

Current filter state. Injected automatically when placed inside a Dashboard.
For standalone use, pass explicitly.

***

#### parentFilters

> **parentFilters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Parent filters for cascading behavior. Out of scope for phase 1.

### Widget

#### config

> **config**?: [`FilterWidgetConfig`](interface.FilterWidgetConfig.md)

Configuration of the widget.

***

#### filterType

> **filterType**?: [`FilterWidgetFilterType`](../type-aliases/type-alias.FilterWidgetFilterType.md)

How the filter is rendered. Defaults to `'members'` (searchable member-select dropdown).
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

> **styleOptions**?: [`WidgetContainerStyleOptions`](../../sdk-ui/interfaces/interface.WidgetContainerStyleOptions.md)

Style options for the widget container (look & feel, border, shadow, etc.).

Note: the default header toolbar (info button with datasource/refresh) is
always hidden for this widget — those actions do not apply to a filter
control. A custom `header.renderToolbar` is still invoked, but receives an
empty default toolbar.

***

#### title

> **title**?: `string`

Widget title. Auto-populated from `attribute.name` if not set.
