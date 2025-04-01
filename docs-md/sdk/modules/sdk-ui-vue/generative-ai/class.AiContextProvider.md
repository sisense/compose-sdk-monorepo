---
title: AiContextProvider
---

# Class AiContextProvider <Badge type="beta" text="Beta" />

A Vue component that wraps all generative AI components and hooks.

::: warning Note
This component is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.
:::

## Example

```vue
<script setup lang="ts">
import { SisenseContextProvider } from '@sisense/sdk-ui-vue';
import { AiContextProvider, Chatbot } from '@sisense/sdk-ui-vue/ai';
</script>

<template>
 <SisenseContextProvider v-bind="sisenseContextProps">
   <AiContextProvider>
     <Chatbot />
   </AiContextProvider>
 </SisenseContextProvider>
</template>
```

## Param

[AiContextProviderProps](../interfaces/interface.AiContextProviderProps.md)

## Properties

### volatile

> **`readonly`** **volatile**?: `boolean`

AI context volatile mode
