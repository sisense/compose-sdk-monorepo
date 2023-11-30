---
title: SharedFormulaLoadingState
---

# Type alias SharedFormulaLoadingState

> **SharedFormulaLoadingState**: `object`

State of a shared formula loading.

## Type declaration

### `error`

**error**: `undefined`

The error if any occurred

***

### `formula`

**formula**: [`CalculatedMeasure`](../../sdk-data/interfaces/interface.CalculatedMeasure.md) \| `null`

The result shared formula if the load has succeeded

***

### `isError`

**isError**: `false`

Whether the shared formula load has failed

***

### `isLoading`

**isLoading**: `true`

Whether the shared formula is loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the shared formula load has succeeded

***

### `status`

**status**: `"loading"`

The status of the shared formula load
