---
title: UseGetQueryRecommendationsState
---

# Interface UseGetQueryRecommendationsState

State for [useGetQueryRecommendations](../generative-ai/function.useGetQueryRecommendations.md) hook.

## Properties

### data

> **data**: [`QueryRecommendation`](interface.QueryRecommendation.md)[] \| `undefined`

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
