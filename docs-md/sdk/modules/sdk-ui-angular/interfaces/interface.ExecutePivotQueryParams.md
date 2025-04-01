---
title: ExecutePivotQueryParams
---

# Interface ExecutePivotQueryParams

Parameters for pivot data query execution.

## Properties

### Data Options

#### columns

> **columns**?: ([`Attribute`](../../sdk-data/interfaces/interface.Attribute.md) \| [`PivotAttribute`](../../sdk-data/interfaces/interface.PivotAttribute.md))[]

Dimensions for the columns of the pivot table

***

#### dataSource

> **dataSource**?: [`DataSource`](../../sdk-data/type-aliases/type-alias.DataSource.md)

Data source the query is run against - e.g. `Sample ECommerce`

If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.

***

#### grandTotals

> **grandTotals**?: [`PivotGrandTotals`](../../sdk-data/type-aliases/type-alias.PivotGrandTotals.md)

Options for grand totals

***

#### rows

> **rows**?: ([`Attribute`](../../sdk-data/interfaces/interface.Attribute.md) \| [`PivotAttribute`](../../sdk-data/interfaces/interface.PivotAttribute.md))[]

Dimensions for the rows of the pivot table

***

#### values

> **values**?: ([`Measure`](../../sdk-data/interfaces/interface.Measure.md) \| [`PivotMeasure`](../../sdk-data/interfaces/interface.PivotMeasure.md))[]

Measures for the values of the pivot table

### Filtering

#### filters

> **filters**?: [`FilterRelations`](../../sdk-data/interfaces/interface.FilterRelations.md) \| [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will slice query results

***

#### highlights

> **highlights**?: [`Filter`](../../sdk-data/interfaces/interface.Filter.md)[]

Filters that will highlight query results

### Other

#### beforeQuery

> **beforeQuery**?: (`jaql`) => `any`

Sync or async callback that allows to modify the JAQL payload before it is sent to the server.

##### Parameters

| Parameter | Type |
| :------ | :------ |
| `jaql` | `any` |

##### Returns

`any`
