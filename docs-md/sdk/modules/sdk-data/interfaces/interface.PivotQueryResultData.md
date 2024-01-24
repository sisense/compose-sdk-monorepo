---
title: PivotQueryResultData
---

# Interface PivotQueryResultData

Pivot query result data set, which includes both a flat table of [QueryResultData](interface.QueryResultData.md) and grids of tree structures.

## Properties

### Table

#### table

> **table**: [`QueryResultData`](interface.QueryResultData.md)

Flat table structure

### Tree Structures

#### grids

> **grids**?: `object`

Grids of tree structures

##### Type declaration

> ###### `grids.columns`
>
> **columns**: [`PivotGrid`](../type-aliases/type-alias.PivotGrid.md)
>
> ###### `grids.corner`
>
> **corner**: [`PivotGrid`](../type-aliases/type-alias.PivotGrid.md)
>
> ###### `grids.rows`
>
> **rows**: [`PivotGrid`](../type-aliases/type-alias.PivotGrid.md)
>
> ###### `grids.values`
>
> **values**: [`PivotGrid`](../type-aliases/type-alias.PivotGrid.md)
>
>
