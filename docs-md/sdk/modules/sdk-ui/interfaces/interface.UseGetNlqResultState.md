---
title: UseGetNlqResultState
---

# Interface UseGetNlqResultState

State for [useGetNlqResult](../generative-ai/function.useGetNlqResult.md) hook.

## Properties

### data

> **data**: [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `undefined`

The result data

***

### error

> **error**: `unknown`

The error if any occurred

***

### isError

> **isError**: `boolean`

Whether the data fetching has failed

***

### isLoading

> **isLoading**: `boolean`

Whether the data fetching is loading

***

### isSuccess

> **isSuccess**: `boolean`

Whether the data fetching has succeeded

***

### refetch

> **refetch**: () => `void`

Callback to trigger a refetch of the data

#### Returns

`void`
