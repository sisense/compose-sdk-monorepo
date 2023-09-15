---
title: Data
---

# Interface Data

Data set, which is made up of an array of [columns](interface.Data.md#columns)
and a two-dimensional array of data [cells](interface.Cell.md).

This structure can be used for user-provided data in [Chart components](../../sdk-ui/interfaces/interface.ChartProps.md).

## Properties

### columns

> **columns**: [`Column`](interface.Column.md)[]

Array of [columns](interface.Data.md#columns)

***

### rows

> **rows**: (`string` \| `number` \| [`Cell`](interface.Cell.md))[][]

Two-dimensional array of data cells, each of which is either a string, number, or type [Cell](interface.Cell.md)
