---
title: SharedFormulaSuccessState
---

# Type alias SharedFormulaSuccessState

> **SharedFormulaSuccessState**: `object`

State of a shared formula load that has succeeded.

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

**isLoading**: `false`

Whether the shared formula is loading

***

### `isSuccess`

**isSuccess**: `true`

Whether the shared formula load has succeeded

***

### `status`

**status**: `"success"`

The status of the shared formula load
