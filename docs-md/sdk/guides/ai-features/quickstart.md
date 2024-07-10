# Quickstart

In this guide we present some examples of how to get started using:

- [The AI Chatbot](#chatbot)
- [Query results natural language generation (NLG)](#query-results-natural-language-generation-nlg)
- [Query recommendations](#query-recommendations)

::: warning Note
This feature is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements. We’re excited to work closely with customers who are eager to get hands-on, test, and help shape this game-changing feature.

To be considered for the beta program, please sign up at [www.sisense.com/get/gen-ai-partner](https://www.sisense.com/get/gen-ai-partner/).
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
  }}
>
  <Chatbot />
</ThemeProvider>
```

## Query Results Natural Language Generation (NLG)

NLG query results are natural language textual insights generated from the query result. You can get NLG query results without using a chatbot. This allows you to create your own interface for NLGs.

To do so, you can use the `useNlgQueryResult()` hook or the `<GetNlgQueryResult />` component.

- Use the `useNlgQueryResult()` hook to get a plain text response to a query, without any built-in UI.
- Use the `<GetNlgQueryResult />` component to get a text response in a container that is collapsible if the returned text is long.

### useNlgQueryResult Hook

To use the `useNlgQueryResult()` hook, call the hook with the query information and handle the returned result.

```ts
import { useNlgQueryResult } from '@sisense/sdk-ui/ai';

// ...

const { data, isLoading } = useGetNlgQueryResult({
  dataSource: DM.DataSource,
  dimensions: [DM.Commerce.Date.Years],
  measures: [measureFactory.sum(DM.Commerce.Revenue)],
});

if (isLoading) {
  return <div>Loading...</div>;
}

return <p>{data}</p>;
```

### GetNlgQueryResult Component

To use the `<GetNlgQueryResult />` component, add it to your code with the query information.

```ts
import { GetNlgQueryResult } from '@sisense/sdk-ui/ai';

// ...

<GetNlgQueryResult
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
