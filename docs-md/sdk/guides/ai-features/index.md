---
title: Generative AI (Beta)
indexTopics:
    - title: Quickstart
      description: Learn how to get started with the AI components and hooks
      link: ./quickstart
    - title: Chatbot
      description: Learn what your users can do with the AI chatbot
      link: ./chatbot
---

# Conversational Analytics with Generative AI  <Badge type="beta" text="Beta" />

Compose SDK contains generative AI (GenAI) React components and hooks for creating conversational analytics experiences.

::: warning Note
This feature is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements.

The GenAI components and hooks enable you to:

- **Deliver in-app analytics chat**: Enable business users to uncover data insights easily by asking questions in a conversational interface, using the `<Chatbot />` component. Learn more [about the chatbot](./chatbot.md) or see how to [get started using the chatbot](./quickstart.md#chatbot) in your code.
- **Provide easy quickstart insights**: Encourage exploration of the data landscape with AI-generated recommended queries from within the chatbot or with the `useGetQueryRecommendations()` hook. See how to [get started using query recommendations](./quickstart.md#query-recommendations) in your code.
- **Bring insights to life with data storytelling**: Enhance collaboration and add context to your data with auto-generated, natural language insights using the `<GetNlgInsights />` component or the `useGetNlgInsights()` hook. See how to [get started using natural language insights](./quickstart.md#natural-language-generation-nlg-insights) in your code.

<SectionIndex />

## APIs

Visit the following pages to learn more about usage and examples:

- Component [AiContextProvider](../../modules/sdk-ui/generative-ai/function.AiContextProvider.md)
- Component [Chatbot](../../modules/sdk-ui/generative-ai/function.Chatbot.md)
- Component [GetNlgInsights](../../modules/sdk-ui/generative-ai/function.GetNlgInsights.md)
- Hook [useGetNlgInsights](../../modules/sdk-ui/generative-ai/function.useGetNlgInsights.md)
- Hook [useGetQueryRecommendations](../../modules/sdk-ui/generative-ai/function.useGetQueryRecommendations.md)
