---
title: ChatConfig
---

# Interface ChatConfig

## Properties

### defaultContextTitle

> **defaultContextTitle**?: `string`

The default context (data model or perspective) title to use for a chat session

If specified, the data topic selector screen will not be shown.

***

### enableFollowupQuestions

> **enableFollowupQuestions**: `boolean`

Boolean flag to show or hide suggested questions following a chat response

If not specified, the default value is `false`

***

### numOfRecommendations

> **numOfRecommendations**: `number`

Number of recommended queries that should be shown in a chat session

If not specified, the default value is `4`
