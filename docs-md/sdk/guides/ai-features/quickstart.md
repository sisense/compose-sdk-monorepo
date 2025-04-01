# Quickstart

In this guide we present some examples of how to get started using:

- [The AI Chatbot](#chatbot)
- [Query results natural language generation (NLG)](#query-results-natural-language-generation-nlg)
- [Query recommendations](#query-recommendations)

::: warning Note
This feature is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements. We’re striving to reach General Availability in the first half of 2025.
:::

## Prerequisites

Here, we assume you already have a working project with the following. If you don't already have a working project, see the [Compose SDK Quickstart](../../getting-started) to create one.

- `@sisense/sdk-ui` version `1.13.0` or higher
- Sisense Fusion instance: Version L2024.1 Service Update 1 or higher.
- Your own LLM API key for GPT-3.5.
- AI (LLM) settings should be enabled and configured in the Sisense application under the `Admin` section. Please follow the steps in [Enabling GenAI](https://docs.sisense.com/main/SisenseLinux/genai.htm#EnablingGenAI).

## Project Setup

To use AI features, import `AiContextProvider` and any other components or hooks you are using from `@sisense/sdk-ui/ai` and wrap your code in an `AiContextProvider`:

```ts
import App from './App.tsx';
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider } from '@sisense/sdk-ui/ai';

const sisenseContextProps = { /* Sisense configuration */ };

// ...

<SisenseContextProvider {...sisenseContextProps}>
  <AiContextProvider>
    <App />
  </AiContextProvider>
</SisenseContextProvider>
```

## Chatbot

Here are some examples of how to work with the chatbot. To learn more about what you can do with a chatbot, see [Chatbot Features](./chatbot.md).

### Default Chatbot

To render a chatbot with the default settings, simply add the `<Chatbot />` component to your code without specifying any props.

```ts
import { Chatbot } from '@sisense/sdk-ui/ai';

// ...

<Chatbot />
```

### Custom Configurations

You can also configure the chatbot with certain options.

#### Change Dimensions

To change the chatbot's dimensions, provide values for the `width` and `height` properties.

```ts
<Chatbot
  width="700px"
  height="1000px"
/>
```

#### Change Behavior

To change the chatbot's default behavior or text content, provide an object to the `config` property.

```ts
<Chatbot
  config={{
    enableFollowupQuestions: true,
    numOfRecommendations: 4,
    dataTopicsList: ['Sample ECommerce'],
    inputPromptText: 'Ask me anything',
    welcomeText: 'Welcome to Sisense AI',
    enableHeader: false,
    enableInsights: true,
  }}
/>
```

#### Change Look and Feel

To change the look and feel of the chatbot, wrap the component in a `ThemeProvider` and specify properties under the `aiChat` field.

```ts
<ThemeProvider
  theme={{
    aiChat: {
      backgroundColor: '#222222',
      primaryTextColor: 'rgba(255, 255, 255, 0.7)',
      secondaryTextColor: 'rgba(255, 255, 255, 0.7)',
      primaryFontSize: ['14px', '16px'],
    }
  }}
>
  <Chatbot />
</ThemeProvider>
```

## Natural Language Generation (NLG)

Natural language textual insights generated from the data results of the provided query parameters.

You can either use the `useNlgInsights()` hook or the `<GetNlgInsights />` component.

- Use the `useNlgInsights()` hook to get a plain text response to a query, without a Compose SDK UI Component.
- Use the `<GetNlgInsights />` component to get a text response rendered within a container, that is collapsible if the returned text is long.

### useNlgInsights Hook

To use the `useNlgInsights()` hook, call the hook with the query information and handle the returned result.

```ts
import { useNlgInsights } from '@sisense/sdk-ui/ai';

// ...

const { data, isLoading } = useGetNlgInsights({
  dataSource: DM.DataSource,
  dimensions: [DM.Commerce.Date.Years],
  measures: [measureFactory.sum(DM.Commerce.Revenue)],
});

if (isLoading) {
  return <div>Loading...</div>;
}

return <p>{data}</p>;
```

### GetNlgInsights Component

To use the `<GetNlgInsights />` component, add it to your code with the query information.

```ts
import { GetNlgInsights } from '@sisense/sdk-ui/ai';

// ...

<GetNlgInsights
  dataSource={DM.DataSource}
  dimensions={[DM.Commerce.Date.Years]}
  measures={[measureFactory.sum(DM.Commerce.Revenue)]}
/>
```

## Query Recommendations

Query recommendations are AI-generated queries that you can run on your data model. You can get query recommendations without using a chatbot. This allows you to create your own interface for query recommendations.

To do so, use the `useGetQueryRecommendations()` hook by providing a data model context for the query recommendations and, optionally, a number of recommendations you want to receive.

The hook returns an array of `QueryRecommendation` entities, which include `NlqResponseData` objects that contain information about the recommended queries.

In this example, we use `NlqResponseData` to create a listing of suggested questions.

```ts
import { useGetQueryRecommendations } from '@sisense/sdk-ui/ai';

// ...

const { data, isLoading } = useGetQueryRecommendations({
  contextTitle: DM.DataSource,
  count: 6
});

if (isLoading) {
  return <div>Loading recommendations</div>;
}

return (
  <ul>
    {data.map((item, index) => (
      <li key={index}>{item.nlqPrompt}</li>
    ))}
  </ul>
);
```
