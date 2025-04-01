---
title: useGetNlqResult
---

# Function useGetNlqResult <Badge type="beta" text="Beta" />

> **useGetNlqResult**(`params`): [`UseGetNlqResultState`](../interfaces/interface.UseGetNlqResultState.md)

A Vue composable that enables natural language query (NLQ) against a data model or perspective.

::: warning Note
This composable is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MaybeRefOrWithRefs`](../type-aliases/type-alias.MaybeRefOrWithRefs.md)\< [`UseGetNlqResultParams`](../interfaces/interface.UseGetNlqResultParams.md) \> | [UseGetNlqResultParams](../interfaces/interface.UseGetNlqResultParams.md) |

## Returns

[`UseGetNlqResultState`](../interfaces/interface.UseGetNlqResultState.md)

The composable NLQ load state that contains the status of the execution, the result (data) as WidgetProps

## Example

```vue
<script setup lang="ts">
import { ChartWidget } from '@sisense/sdk-ui-vue';
import { useGetNlqResult, type UseGetNlqResultParams } from '@sisense/sdk-ui-vue/ai';

const params: UseGetNlqResultParams = {
 dataSource: 'Sample Retail',
 query: 'Show me the lowest product prices by country'
};
const { data: nlqResult } = useGetNlqResult(params);
</script>

<template>
 <ChartWidget v-bind="nlqResult" />
</template>
```
