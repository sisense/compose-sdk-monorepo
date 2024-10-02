---
title: WidgetModelLoadingState
---

# Type alias WidgetModelLoadingState

> **WidgetModelLoadingState**: `object`

State of a widget model that is loading.

## Type declaration

### `error`

**error**: `undefined`

Error, if one occurred

***

### `isError`

**isError**: `false`

Whether the widget model load has failed

***

### `isLoading`

**isLoading**: `true`

Whether the widget model is loading

***

### `isSuccess`

**isSuccess**: `false`

Whether the widget model load has succeeded

***

### `status`

**status**: `"loading"`

Loading status

***

### `widget`

**widget**: [`WidgetModel`](../fusion-embed/interface.WidgetModel.md) \| `undefined`

Widget model, if the load succeeded
