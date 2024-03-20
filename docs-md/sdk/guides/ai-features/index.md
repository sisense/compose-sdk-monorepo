---
title: Generative AI (Private Beta)
indexTopics:
    - title: Quickstart
      description: Learn how to get started with the AI components and hooks
      link: ./quickstart
    - title: Chatbot
      description: Learn what your users can do with the AI chatbot
      link: ./chatbot
    - title: Troubleshooting
      description: Find solutions to common issues
      link: ./troubleshooting
---

# Conversational Analytics with Generative AI  <Badge type="beta" text="Private Beta" />

Compose SDK contains generative AI (GenAI) React components and hooks for creating conversational analytics experiences.

::: warning Note
This feature is currently under private beta for selected customers and is subject to changes as we make fixes and improvements. We’re excited to work closely with customers who are eager to get hands-on, test, and help shape this game-changing feature.

To be considered for the beta program, please sign up at [www.sisense.com/get/gen-ai-partner](https://www.sisense.com/get/gen-ai-partner/).
:::

The GenAI components and hooks enable you to:

- **Deliver in-app analytics chat**: Enable business users to uncover data insights easily by asking questions in a conversational interface, using the `<Chatbot />` component. Learn more [about the chatbot](./chatbot.md) or see how to [get started using the chatbot](./quickstart.md#chatbot) in your code.
- **Provide easy quickstart insights**: Encourage exploration of the data landscape with AI-generated recommended queries from within the chatbot or with the `useGetQueryRecommendations()` hook. See how to [get started using query recommendations](./quickstart.md#query-recommendations) in your code.
- **Bring insights to life with data storytelling**: Enhance collaboration and add context to your data with auto-generated, natural language insights using the `<GetNlgQueryResult />` component or the `useGetNlgQueryResult()` hook. See how to [get started using natural language insights](./quickstart.md#natural-language-generation-nlg-query-results) in your code.

<SectionIndex />

## APIs

Visit the following pages to learn more about usage and examples:

- Component [AiContextProvider](../../modules/sdk-ui/generative-ai/function.AiContextProvider.md)
- Component [Chatbot](../../modules/sdk-ui/generative-ai/function.Chatbot.md)
- Component [GetNlgQueryResult](../../modules/sdk-ui/generative-ai/function.GetNlgQueryResult.md)
- Hook [useGetNlgQueryResult](../../modules/sdk-ui/generative-ai/function.useGetNlgQueryResult.md)
- Hook [useGetQueryRecommendations](../../modules/sdk-ui/generative-ai/function.useGetQueryRecommendations.md)
