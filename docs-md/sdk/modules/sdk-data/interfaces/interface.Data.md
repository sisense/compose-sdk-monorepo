---
title: Data
---

# Interface Data

Data set, which is made up of an array of [columns](interface.Column.md)
and a two-dimensional array of data [cells](interface.Cell.md).

This structure can be used for user-provided data in [Chart components](../../sdk-ui/interfaces/interface.ChartProps.md).

## Properties

### columns

> **columns**: [`Column`](interface.Column.md)[]

Array of [columns](interface.Column.md)

***

### rows

> **rows**: ([`Cell`](interface.Cell.md) \| `number` \| `string`)[][]

Two-dimensional array of data cells, each of which is either a string, number, or type [Cell](interface.Cell.md)
