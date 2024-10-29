---
title: DashboardModelLoadingState
---

# Type alias DashboardModelLoadingState

> **DashboardModelLoadingState**: `object`

State of a dashboard model loading.

## Type declaration

### `dashboard`

**dashboard**: [`DashboardModel`](../fusion-assets/interface.DashboardModel.md) \| `undefined`

The result dashboard model if the load has succeeded

***

### `error`

**error**: `undefined`

The error if any occurred

***

### `isError`

**isError**: `false`

Whether the dashboard model load has failed

***

### `isLoading`

**isLoading**: `true`

Whether the dashboard model is loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the dashboard model load has succeeded

***

### `status`

**status**: `"loading"`

The status of the dashboard model load
