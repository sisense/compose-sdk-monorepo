---
title: PivotTableDataOptions
---

# Interface PivotTableDataOptions

Configuration for how to query data and assign data to PivotTable.

## Properties

### Data Options

#### columns

> **columns**?: ([`StyledColumn`](interface.StyledColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md))[]

Dimensions for the columns of the pivot table

***

#### grandTotals

> **grandTotals**?: [`PivotGrandTotals`](../../sdk-data/type-aliases/type-alias.PivotGrandTotals.md)

Options for grand totals

***

#### rows

> **rows**?: ([`StyledColumn`](interface.StyledColumn.md) \| [`Column`](../../sdk-data/interfaces/interface.Column.md))[]

Dimensions for the rows of the pivot table

***

#### values

> **values**?: ([`MeasureColumn`](../../sdk-data/interfaces/interface.MeasureColumn.md) \| [`CalculatedMeasureColumn`](../../sdk-data/interfaces/interface.CalculatedMeasureColumn.md) \| [`StyledMeasureColumn`](interface.StyledMeasureColumn.md))[]

Measures for the values of the pivot table
