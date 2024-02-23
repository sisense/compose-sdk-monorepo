# AI Components (Private Preview)

This is a short overview of how to work with the new AI components from Compose SDK. Please note that this is not official documentation and is subject to change as we make fixes and improvements.

## Prerequisites

1. Ensure an LLM provider is configured on the target Sisense instance. This should be done by a Sisense administrator.
1. Install `@sisense/sdk-ui`, version `0.15.0` or higher.

## Overview

The following is a list of components and hooks we export, starting in `v0.15.0` of Compose SDK, under the `/ai` subpath.

- `AiContextProvider`
- `Chatbot`
- `GetNlgQueryResult`
- `useGetNlgQueryResult`
- `useGetQueryRecommendations`

## Usage and Examples

Here are some examples of how to use each hook/component.

### `AiContextProvider`

This wrapper component is like a `SisenseContextProvider.` Any AI Chat component or hook should be wrapped in a `AiContextProvider`. Here's an example:

```tsx
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Chatbot />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```

### `Chatbot`

This is the full-fledged chatbot component with data topic selection. You can optionally provide `width` and/or `height`.

```tsx
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Chatbot width={1000} height={800} />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```

### `useGetNlgQueryResult`

This hook returns a summary in natural language, highlighting key insights about the passed-in JAQL.

Note that this hook expects `metadata` below to be in standard JAQL syntax. In the future, we plan to support the same Compose SDK structures that are used in `Chart`/`ExecuteQuery` props.

```tsx
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, useGetNlgQueryResult } from '@sisense/sdk-ui/ai';

function Page() {
  const { data } = useGetNlgQueryResult({
    dataSource: 'Sample ECommerce',
    metadata: [
      {
        jaql: {
          column: 'Date',
          datatype: 'datetime',
          dim: '[Commerce.Date]',
          firstday: 'mon',
          level: 'years',
          table: 'Commerce',
          title: 'Date',
        },
        format: {
          mask: {
            days: 'shortDate',
            isdefault: true,
            minutes: 'HH:mm',
            months: 'MM/yyyy',
            quarters: 'yyyy Q',
            weeks: 'ww yyyy',
            years: 'yyyy',
          },
        },
      },
      {
        jaql: {
          agg: 'sum',
          column: 'Revenue',
          datatype: 'numeric',
          dim: '[Commerce.Revenue]',
          table: 'Commerce',
          title: 'total of Revenue',
        },
      },
    ],
  });
  return (
    <>
      <h1>Summary</h1>
      <p>{data}</p>
    </>
  );
}

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Page />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```

### `GetNlgQueryResult`

This takes the same props as `useGetNlgQueryResult` and makes the same API call but presents the result in a collapsible container.

```tsx
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, GetNlgQueryResult } from '@sisense/sdk-ui/ai';

function Page() {
  return (
    <GetNlgQueryResult
      dataSource="Sample ECommerce"
      metadata={[
        {
          jaql: {
            column: 'Date',
            datatype: 'datetime',
            dim: '[Commerce.Date]',
            firstday: 'mon',
            level: 'years',
            table: 'Commerce',
            title: 'Date',
          },
          format: {
            mask: {
              days: 'shortDate',
              isdefault: true,
              minutes: 'HH:mm',
              months: 'MM/yyyy',
              quarters: 'yyyy Q',
              weeks: 'ww yyyy',
              years: 'yyyy',
            },
          },
        },
        {
          jaql: {
            agg: 'sum',
            column: 'Revenue',
            datatype: 'numeric',
            dim: '[Commerce.Revenue]',
            table: 'Commerce',
            title: 'total of Revenue',
          },
        },
      ]}
    />
  );
}

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Page />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```

### `useGetQueryRecommendations`

This hook includes the same code that fetches the initial suggested questions in the chatbot. You can use this to fetch suggested questions and their corresponding recommended JAQL for any provided data model or perspective title.

```tsx
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, useGetQueryRecommendations } from '@sisense/sdk-ui/ai';

function Page() {
  const { data } = useGetQueryRecommendations({
    contextTitle: 'Sample ECommerce',
  });

  if (!data) {
    return <div>Loading recommendations</div>;
  }

  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{item.nlqPrompt}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Page />
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```
