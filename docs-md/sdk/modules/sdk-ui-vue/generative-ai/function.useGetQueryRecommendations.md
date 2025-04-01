---
title: useGetQueryRecommendations
---

# Function useGetQueryRecommendations <Badge type="beta" text="Beta" />

> **useGetQueryRecommendations**(`params`): [`UseGetQueryRecommendationsState`](../interfaces/interface.UseGetQueryRecommendationsState.md)

A Vue composable that fetches recommended questions for a data model or perspective.

This composable includes the same code that fetches the initial suggested questions in the chatbot.

::: warning Note
This composable is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`UseGetQueryRecommendationsParams`](../interfaces/interface.UseGetQueryRecommendationsParams.md) \> | [UseGetQueryRecommendationsParams](../interfaces/interface.UseGetQueryRecommendationsParams.md) |

## Returns

[`UseGetQueryRecommendationsState`](../interfaces/interface.UseGetQueryRecommendationsState.md)

The composable load state that contains the status of the execution and recommendations result (data) with recommended question text and its corresponding `widgetProps`

## Example

```vue
<script setup lang="ts">
import {
 useGetQueryRecommendations,
 type UseGetQueryRecommendationsParams,
} from '@sisense/sdk-ui-vue/ai';

const params: UseGetQueryRecommendationsParams = {
 contextTitle: 'Sample Retail',
 count: 3,
};
const { data: recommendations = [] } = useGetQueryRecommendations(params);
</script>

<template>
 <ul>
   <li v-for="r in recommendations" :key="r.nlqPrompt">
     {{ r.nlqPrompt }}
   </li>
 </ul>
</template>
```
