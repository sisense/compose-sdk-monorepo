---
title: Quickstart Guide (React)
---

# Generative AI with React: Quickstart Guide

This guide offers examples for getting started with:

- [AI Chatbot](#chatbot)
- [Natural language generation (NLG) for Insights](#natural-language-generation-nlg)
- [Natural language query (NLQ)](#natural-language-query-nlq)
- [Query recommendations](#query-recommendations)

## Prerequisites

This guide assumes you already have a React project working with Compose SDK. If you don't already have a working project, follow the [Compose SDK Quickstart](../../getting-started) before continuing here. The additional prerequsities for Generative AI are listed below:

- `@sisense/sdk-ui` version `2.0.0` or higher
- Sisense Fusion version L2025.2 or higher, with Generative AI and LLM enabled per the [Sisense Documentation](https://docs.sisense.com/main/SisenseLinux/genai.htm)

## Project Setup

To use AI features in Compose SDK, all AI related components or hooks imported from `@sisense/sdk-ui/ai` must be wrapped with an `AiContextProvider` component within your application code. For example:

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
<br />

## Chatbot

Here are some examples of how to work with the [`<Chatbot>`](../../modules/sdk-ui/generative-ai/function.Chatbot.md) component.

### Default Chatbot

To display a chatbot with the default settings, simply add the [`<Chatbot />`](../../modules/sdk-ui/generative-ai/function.Chatbot.md) component to your code without specifying any props.

```ts
import { Chatbot } from '@sisense/sdk-ui/ai';

// ...

<Chatbot />
```

### Custom Configuration

You can also configure the Chatbot with custom options, including size, behavior and look and feel.

#### Change Size

To change the size of the displayed Chatbot, provide values for the `width` and `height` properties (props).
For more information refer to [ChatbotProps](../../modules/sdk-ui/interfaces/interface.ChatbotProps.md)

```ts
<Chatbot
  width="700px"
  height="1000px"
/>
```

#### Change Behavior

To change the Chatbot's default behavior or text content, provide an object to the `config` property.
For more information refer to [ChatConfig](../../modules/sdk-ui/interfaces/interface.ChatConfig.md)

```ts
<Chatbot
  config={{
    enableFollowupQuestions: true,
    numOfRecommendations: 2,
    dataTopicsList: [
      'Sample ECommerce',
      'Sample Healthcare'
    ],
    inputPromptText: 'What do you want to explore?',
    welcomeText: 'Welcome to Acme AI, powered by Sisense',
    suggestionsWelcomeText: 'Would you like to know:',
  }}
/>
```

#### Change Look and Feel

To change the look and feel of the chatbot, wrap the component in a [`<ThemeProvider>`](../../modules/sdk-ui/contexts/function.ThemeProvider.md) and specify properties under the `aiChat` field.
For more information refer to [AiChatThemeSettings](../../modules/sdk-ui/interfaces/interface.AiChatThemeSettings.md)

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
<br />

## Natural Language Generation (NLG Insights)

Natural language textual insights generated from the data results of the provided query parameters.

There are different options for generating NLG insights using a Compose SDK query:

- Use the [`useGetNlgInsights()`](../../modules/sdk-ui/generative-ai/function.useGetNlgInsights.md) hook as an API to return a plain text response, and render it how you like using your own code / component.
- Use the [`<GetNlgInsights />`](../../modules/sdk-ui/generative-ai/function.GetNlgInsights.md) component to get display the generated text response in a styled container.

### useNlgInsights Hook

To use the [`useGetNlgInsights()`](../../modules/sdk-ui/generative-ai/function.useGetNlgInsights.md) hook, call the hook with the query information and handle the returned result.

```ts
import { useGetNlgInsights } from '@sisense/sdk-ui/ai';

// ...

const { data, isLoading } = useGetNlgInsights({
  dataSource: DM.DataSource,
  dimensions: [DM.Commerce.Date.Years],
  measures: [measureFactory.sum(DM.Commerce.Revenue)],
  verbosity: 'Low'
});

if (isLoading) {
  return <div>Loading...</div>;
}

return <p>{data}</p>;
```

### GetNlgInsights Component

To use the [`<GetNlgInsights />`](../../modules/sdk-ui/generative-ai/function.GetNlgInsights.md) component, add it to your code with the query information.

```ts
import { GetNlgInsights } from '@sisense/sdk-ui/ai';

// ...

<GetNlgInsights
  dataSource={DM.DataSource}
  dimensions={[DM.Commerce.Date.Years]}
  measures={[measureFactory.sum(DM.Commerce.Revenue)]}
  verbosity: 'High'
/>
```
<br />

## Natural Language Query (NLQ)

Generate properties for a [`<Widget>`](../../modules/sdk-ui/dashboards/function.Widget.md) by asking a question in natural language, with the `useGetNlqResult` hook.

Provide the question and datamodel name, and receive [`WidgetProps`](../../modules/sdk-ui/type-aliases/type-alias.WidgetProps.md) as a response, then render the result in a [`<Widget>`](../../modules/sdk-ui/dashboards/function.Widget.md) component.

```ts
import { useGetNlqResult } from '@sisense/sdk-ui/ai';

// ...

const { data, isLoading} = useGetNlqResult({
  dataSource: 'Sample ECommerce',
  query: 'total sales by month',
});

if (isLoading) {
  return <div>Loading result</div>;
}

return (
  <>
    {data && <Widget {...data} /> }
  </>
);
```
<br />

## Query Recommendations

Query recommendations are AI-generated queries that you can run on your data model. The provides query recommendations as a standlone capability outside of the conversational analytics flow provided by the [`<Chatbot>`](../../modules/sdk-ui/generative-ai/function.Chatbot.md) component. This enables query recommendation functionality to be delivered in a customized user experience.

To do so, use the [`useGetQueryRecommendations()`](../../modules/sdk-ui/generative-ai/function.useGetQueryRecommendations.md) hook by providing a data model title for the query recommendations and, optionally, the number of recommendations you want to generate.

The hook returns `data` as an array of [`QueryRecommendation`](../../modules/sdk-ui/interfaces/interface.QueryRecommendation.md) entities. These include properties such as:
- The `nlqPrompt` which is the textual representation of the question to ask, to show to the end user
- `widgetProps` that can be passed to a [`<Widget>`](../../modules/sdk-ui/dashboards/function.Widget.md) component to render the results of the generated question.
- other properties e.g `detailedDescription`

In this example, we simply show the list of suggested questions. In practice, the other propeties are then useful if/when a user selects one of the generated questions.

```ts
import { useGetQueryRecommendations, QueryRecommendation } from '@sisense/sdk-ui/ai';

// ...

const { data, isLoading } = useGetQueryRecommendations({
  contextTitle: DM.DataSource.title,
  count: 5
});

if (isLoading) {
  return <div>Loading recommendations..</div>;
}

return (
  <ul>
    {data.map((item: QueryRecommendation, index) => (
      <li key={index}>{item.nlqPrompt}</li>
    ))}
  </ul>
);
```

In this example, both the generated question and the answer (widget) are shown at the same time.

```ts
import { useGetQueryRecommendations, QueryRecommendation } from '@sisense/sdk-ui/ai';

// ...

const { data, isLoading } = useGetQueryRecommendations({
  contextTitle: DM.DataSource.title,
  count: 5
});

if (isLoading) {
  return <div>Loading recommendations..</div>;
}

return (
  <ul>
    {data.map((item: QueryRecommendation, index) => (
      item.widgetProps &&
      <li key={index}>
        <div key={'title-' + index}>{item.nlqPrompt}</div>
        <div key={'chart-' + index}>
          <Widget
            key={'widget-' + index}
            {...item.widgetProps}
          />
        </div>
      </li>
    ))}
  </ul>
);
```
