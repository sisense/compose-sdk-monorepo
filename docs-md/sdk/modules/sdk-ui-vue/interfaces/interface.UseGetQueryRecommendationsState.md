---
title: UseGetQueryRecommendationsState
---

# Interface UseGetQueryRecommendationsState

State for [`useGetQueryRecommendations`](../generative-ai/function.useGetQueryRecommendations.md) composable.

## Properties

### data

> **data**: `Ref`\< [`QueryRecommendation`](interface.QueryRecommendation.md)[] \| `undefined` \>

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
