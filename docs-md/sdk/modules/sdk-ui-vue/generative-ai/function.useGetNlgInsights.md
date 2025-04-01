---
title: useGetNlgInsights
---

# Function useGetNlgInsights <Badge type="beta" text="Beta" />

> **useGetNlgInsights**(`params`): [`UseGetNlgInsightsState`](../interfaces/interface.UseGetNlgInsightsState.md)

A Vue composable that fetches an analysis of the provided query using natural language generation (NLG).
Specifying a query is similar to providing parameters to a [`useExecuteQuery`](../queries/function.useExecuteQuery.md) composable, using dimensions, measures, and filters.

::: warning Note
This composable is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`UseGetNlgInsightsParams`](../interfaces/interface.UseGetNlgInsightsParams.md) \> | [UseGetNlgInsightsParams](../interfaces/interface.UseGetNlgInsightsParams.md) |

## Returns

[`UseGetNlgInsightsState`](../interfaces/interface.UseGetNlgInsightsState.md)

The composable load state that contains the status of the execution and a text summary result (data)

## Example

```vue
<script setup lang="ts">
import { useGetNlgInsights, type GetNlgInsightsProps } from '@sisense/sdk-ui-vue/ai';
import { measureFactory } from '@sisense/sdk-data';
import * as DM from '../assets/sample-retail-model';

const props: GetNlgInsightsProps = {
 dataSource: DM.DataSource.title,
 dimensions: [DM.DimProducts.CategoryName],
 measures: [measureFactory.sum(DM.DimProducts.Price)],
};
const { data: nlgInsights } = useGetNlgInsights(props);
</script>

<template>
 {{ nlgInsights }}
</template>
```
