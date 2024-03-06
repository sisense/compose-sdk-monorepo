---
title: GetNlgQueryResultProps
---

# Interface GetNlgQueryResultProps

Props for [GetNlgQueryResult](../functions/function.GetNlgQueryResult.md) component.

## Extends

- `Omit`\< [`UseGetNlgQueryResultParams`](interface.UseGetNlgQueryResultParams.md), `"enabled"` \>

## Properties

### dataSource

> **dataSource**: `string`

The data source that the query targets - e.g. `Sample ECommerce`

#### Inherited from

Omit.dataSource

***

### dimensions

> **dimensions**?: [`Attribute`](../../sdk-data/interfaces/interface.Attribute.md)[]

Dimensions of the query

#### Inherited from

Omit.dimensions

***

### filters

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters of the query

#### Inherited from

Omit.filters

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

Measures of the query

#### Inherited from

Omit.measures
