---
title: UseGetNlqResultState
---

# Interface UseGetNlqResultState

State for [`useGetNlqResult`](../generative-ai/function.useGetNlqResult.md) composable.

## Properties

### data

> **data**: `Ref`\< [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `undefined` \>

The result data

***

### error

> **error**: `Ref`\< `unknown` \>

The error if any occurred

***

### isError

> **isError**: `Ref`\< `boolean` \>

Whether the data fetching has failed

***

### isLoading

> **isLoading**: `Ref`\< `boolean` \>

Whether the data fetching is loading

***

### isSuccess

> **isSuccess**: `Ref`\< `boolean` \>

Whether the data fetching has succeeded

***

### refetch

> **refetch**: () => `void`

Callback to trigger a refetch of the data

#### Returns

`void`
