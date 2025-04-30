---
title: AiContextProviderProps
---

# Interface AiContextProviderProps

## Properties

### children

> **children**: `ReactNode`

***

### volatile

> **volatile**?: `boolean`

Boolean flag to indicate whether the chat session should be volatile.

When `false` the chat session history will be stored per user per datamodel. The retention period is configurable in Sisense Fusion.

When the `Chatbot` component renders, if a previous chat history exists for the current user and datamodel, it will be restored. The user may continue the conversation or clear the history.

When `true` a new chat session (with no history) will be created each time the `Chatbot` comoponent initializes.

#### Default

```ts
false
```
