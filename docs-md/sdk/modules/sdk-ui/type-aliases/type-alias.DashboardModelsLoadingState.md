---
title: DashboardModelsLoadingState
---

# Type alias DashboardModelsLoadingState

> **DashboardModelsLoadingState**: `object`

State of a dashboard models loading.

## Type declaration

### `dashboards`

**dashboards**: [`DashboardModel`](../fusion-embed/interface.DashboardModel.md)[] \| `undefined`

The result dashboard models if the load has succeeded

***

### `error`

**error**: `undefined`

The error if any occurred

***

### `isError`

**isError**: `false`

Whether the dashboard models load has failed

***

### `isLoading`

**isLoading**: `true`

Whether the dashboard models is loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the dashboard models load has succeeded

***

### `status`

**status**: `"loading"`

The status of the dashboard models load
