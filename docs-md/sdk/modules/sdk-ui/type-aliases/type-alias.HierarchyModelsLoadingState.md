---
title: HierarchyModelsLoadingState
---

# Type alias HierarchyModelsLoadingState

> **HierarchyModelsLoadingState**: `object`

State of hierarchy models that is loading.

## Type declaration

### `error`

**error**: `undefined`

Error, if one occurred

***

### `hierarchies`

**hierarchies**: [`HierarchyModel`](../interfaces/interface.HierarchyModel.md)[] \| `undefined`

Hierarchy models, if the load succeeded

***

### `isError`

**isError**: `false`

Whether the hierarchy models load has failed

***

### `isLoading`

**isLoading**: `true`

Whether the hierarchy models is loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the hierarchy models load has succeeded

***

### `status`

**status**: `"loading"`

Loading status
