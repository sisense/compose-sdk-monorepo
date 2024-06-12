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

Boolean flag to show or hide suggested questions following a chat response. Currently
follow-up questions are still under development and are not validated. Therefore, follow-up
questions are disabled by default.

***

### inputPromptText

> **inputPromptText**: `string`

The input prompt text to show in the chat input box

***

### numOfRecentPrompts

> **numOfRecentPrompts**: `number`

Number of recent prompts that should be shown in a chat session

If not specified, the default value is `5`

***

### numOfRecommendations

> **numOfRecommendations**: `number`

Number of recommended queries that should be shown in a chat session

If not specified, the default value is `4`

***

### suggestionsWelcomeText

> **suggestionsWelcomeText**?: `string` \| `false`

The message text to show above the initial suggested questions in a chat session.

A value of `false` will hide the text.

If not specified, a default message will be displayed.

***

### welcomeText

> **welcomeText**?: `string` \| `false`

The welcome text to show at the top of a chat session.

A value of `false` will hide the welcome text.

If not specified, a default message will be displayed.
