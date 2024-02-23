---
title: Generative AI  (Private Beta)
---

# Conversational Analytics with Generative AI  <Badge type="beta" text="Private Beta" />

Below, you'll find a brief overview of our new generative AI components and hooks
in React for conversational analytics, along with a guide on how to implement
conversational analytics using the Compose SDK.

::: warning Note
This feature is currently under private beta for selected customers and is subject to change as we make fixes and improvements. We’re excited to work closely with customers who are eager to get hands-on, test, and help shape this game-changing feature.

To be considered for the beta program, please signup at [www.sisense.com/get/gen-ai-partner](https://www.sisense.com/get/gen-ai-partner/)
:::

The GenAI APIs will enable you to:

#### Deliver in-app analytics chat
Enable business users to uncover data insights simply by asking questions in a conversational interface,
using the `Chatbot` component.

#### Provide easy quick-start insights
Encourage exploration of the data landscape with AI generated recommended queries,
facilitated by the `useGetQueryRecommendations` hook.

#### Bring insights to life with data storytelling
Enhance collaboration and add context to your data with auto-generated insights through `GetNlgQueryResult` or `useGetNlgQueryResult`.

For more information , please visit [www.sisense.com/platform/conversational-analytics](https://www.sisense.com/platform/conversational-analytics/)

## Prerequisites

1. Ensure a Large Language Model (LLM) such as GPT-3.5-turbo, is configured on the target Sisense instance. This should be done by a Sisense administrator.
1. Install `@sisense/sdk-ui`, version `1.4.0` or higher.

## APIs

Visit the following pages to learn more about usage and examples:

- Component [AiContextProvider](../modules/sdk-ui/functions/function.AiContextProvider.md)
- Component [Chatbot](../modules/sdk-ui/functions/function.Chatbot.md)
- Component [GetNlgQueryResult](../modules/sdk-ui/functions/function.GetNlgQueryResult.md)
- Hook [useGetNlgQueryResult](../modules/sdk-ui/functions/function.useGetNlgQueryResult.md)
- Hook [useGetQueryRecommendations](../modules/sdk-ui/functions/function.useGetQueryRecommendations.md)
