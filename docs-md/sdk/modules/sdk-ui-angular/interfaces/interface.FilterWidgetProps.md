---
title: FilterWidgetProps
---

# Interface FilterWidgetProps <Badge type="beta" text="Beta" />

Props for the filter widget.

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
`'condition'` renders a string condition control for text attributes.
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

> **styleOptions**?: [`FilterWidgetStyleOptions`](../../sdk-ui/type-aliases/type-alias.FilterWidgetStyleOptions.md)

Style options for the widget container (look & feel, border, shadow, etc.), and for the
filter control inside it under `control`.

***

#### title

> **title**?: `string`

Widget title. Auto-populated from `attribute.name` if not set.
