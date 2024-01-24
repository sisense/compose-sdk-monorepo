---
title: ExecuteQueryParams
---

# Interface ExecuteQueryParams

Parameters for data query execution.

## Extends

- `Omit`\< [`ExecuteQueryParams`](../../sdk-ui/interfaces/interface.ExecuteQueryParams.md), `"enabled"` \>

## Properties

### count

> **count**?: `number`

{@inheritDoc ExecuteQueryProps.count}

#### Inherited from

Omit.count

***

### dataSource

> **dataSource**?: `string`

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

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

> **filters**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[] \| [`FilterRelation`](../../sdk-data/interfaces/interface.FilterRelation.md)

Filters that will slice query results

#### Inherited from

Omit.filters

***

### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Highlight filters that will highlight results that pass filter criteria

#### Inherited from

Omit.highlights

***

### measures

> **measures**?: [`Measure`](../../sdk-data/interfaces/interface.Measure.md)[]

Measures of the query

#### Inherited from

Omit.measures

***

### offset

> **offset**?: `number`

{@inheritDoc ExecuteQueryProps.offset}

#### Inherited from

Omit.offset

***

### onBeforeQuery

> **onBeforeQuery**?: (`jaql`) => `any`

{@inheritDoc ExecuteQueryProps.onBeforeQuery}

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `jaql` | `any` |

#### Returns

`any`

#### Inherited from

Omit.onBeforeQuery
