---
title: Generative AI
indexTopics:
    - title: Quickstart Guide (React)
      description: Learn how to get started with Generative AI in using React and Compose SDK
      link: ./quickstart
---

# Generative AI powered by Sisense Intelligence

Compose SDK contains generative AI (GenAI) components and hooks/services that enable the following possibilities:

- **Deliver in-app analytics chat**: Enable business users to uncover data insights easily, by asking questions in a conversational interface using the `<Chatbot />` component. See how to [get started using the chatbot](./quickstart.md#chatbot) in your code.
- **Suggest recommedend questions**: Encourage exploration of the data landscape with AI-generated recommended queries, either directly within the chatbot or as a standlone feature using the `useGetQueryRecommendations()` hook in React and Vue, or the `AiService.getQueryRecommendations` in Angular. See how to [get started using query recommendations](./quickstart.md#query-recommendations) in your code.
- **Bring insights to life with data storytelling**: Enhance collaboration and add context to your data with auto-generated, natural language insights using the `<GetNlgInsights />` component (`GetNlgInsightsComponent` in Angular) or the `useGetNlgInsights()` hook (`AiService.getQueryRecommendations` in Angular). See how to [get started using natural language insights](./quickstart.md#natural-language-generation-nlg-insights) in your code.

<SectionIndex />

Visit the following API References to learn more about usage and examples:

- Generative for [React](../../modules/sdk-ui/generative-ai/)
- Generative for [Angular](../../modules/sdk-ui-angular/generative-ai/)
- Generative for [Vue](../../modules/sdk-ui-vue/generative-ai/)
