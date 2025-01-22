---
title: UseGetNlgInsightsState
---

# Interface UseGetNlgInsightsState

State for [useGetNlgInsights](../generative-ai/function.useGetNlgInsights.md) hook.

## Properties

### data

> **data**: `string` \| `undefined`

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
