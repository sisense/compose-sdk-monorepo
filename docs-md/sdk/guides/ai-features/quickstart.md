# Quickstart

In this guide we present some examples of how to get started using:

- [The AI Chatbot](#chatbot)
- [Query results natural language generation (NLG)](#query-results-natural-language-generation-nlg)
- [Query recommendations](#query-recommendations)

::: warning Note
This feature is currently under beta release for selected customers and is subject to changes as we make fixes and improvements. We’re excited to work closely with customers who are eager to get hands-on, test, and help shape this game-changing feature.

To be considered for the beta program, please sign up at [www.sisense.com/get/gen-ai-partner](https://www.sisense.com/get/gen-ai-partner/).
:::

## Prerequisites

Here, we assume you already have a working project with the following. If you don't already have a working project, see the [Compose SDK Quickstart](../../getting-started) to create one.

- `@sisense/sdk-ui` version `1.6.0` or higher
- A Sisense Fusion instance:
  - Version L2023.11 Service Update 1 or higher
  - Properly licensed, configured, and connected to an LLM

### LLM Setup

To set up an LLM, call the `/api/v2/settings/ai/llmProvider` endpoint and provide the following information:

- `model`: Model deployment name you chose during the deployment process on your LLM platform.
- `baseUrl`: Endpoint URL of your LLM instance.
- `apiKey`: API key for authenticating and authorizing your requests to the model's API.
- `version`: API version to use. This specifies the version of the API for your LLM provider, ensuring compatibility with your model's deployment.
- `provider`: Provider where your GPT-3.5 model is hosted. Currently, we support models hosted on OpenAI or Azure.

Here are some sample configurations:

#### Azure

```json
{
    "model": "gpt-35-turbo-16k",
    "baseUrl": "https://MyLLM.openai.azure.com/",
    "apiKey": "bppQbQ2HDZFlUQ0za8tAT3BlbkFJB9logjzJc8J00W6enN",
    "provider": "azure",
    "version": "2024-02-15-preview"
}
```

#### OpenAI

```json
{
    "model": "gpt-3.5-turbo",
    "baseUrl": null,
    "apiKey": "xreQbQ2HDZFlUQ0za4tAT323bkFJB9logjzJc8J00W6eGF",
    "provider": null,
    "version": null
}
```

## Setup

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

#### Enable Follow-up Questions

You can enable suggested follow-up questions to appear after the chatbot answers a question using the `enableFollowupQuestions` configuration option. Currently, follow-up questions are still under development and are not validated. Therefore, follow-up questions are disabled by default.

```ts
<Chatbot
  config={{
    enableFollowupQuestions: true,
  }}
/>
```

#### Number of Suggested Questions

You can set the number of suggested questions to appear at the beginning of a conversation using the `numOfRecommendations` configuration option. By default, 4 suggested questions appear.

```ts
<Chatbot
  config={{
    numOfRecommendations: 6,
  }}
/>
```

#### Default context

You can skip the context selection that occurs before a conversation starts by providing a data model or perspective title to use.

```ts
<Chatbot
  config={{
    defaultContextTitle: 'Sample ECommerce',
  }}
/>
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
