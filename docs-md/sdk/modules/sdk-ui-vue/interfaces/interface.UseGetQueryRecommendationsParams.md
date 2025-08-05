---
title: UseGetQueryRecommendationsParams
---

# Interface UseGetQueryRecommendationsParams

Parameters for [`useGetQueryRecommendations`](../generative-ai/function.useGetQueryRecommendations.md) composable.

## Properties

### contextTitle

> **contextTitle**: `string`

Data model title or perspective title

***

### count

> **count**?: `number`

Number of recommendations that should be returned

If not specified, the default value is `4`

***

### customPrompt

> **customPrompt**?: `string`

Pass a custom prompt to AI when generating query recommendations

e.g. "Focus on age range"

***

### enabled

> **enabled**?: `boolean`

Boolean flag to control if the hook is executed

If not specified, the default value is `true`
