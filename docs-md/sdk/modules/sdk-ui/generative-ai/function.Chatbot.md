---
title: Chatbot
---

# Function Chatbot

> **Chatbot**(`props`): `ReactElement`\< `any`, `any` \> \| `null`

React component that displays a chatbot with data topic selection.
You can optionally configure size, config e.g. data topics, recommendations, UI text.

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `props` | [`ChatbotProps`](../interfaces/interface.ChatbotProps.md) | [ChatbotProps](../interfaces/interface.ChatbotProps.md) |

## Returns

`ReactElement`\< `any`, `any` \> \| `null`

## Example

```ts
import { SisenseContextProvider } from '@ethings-os/sdk-ui';
import { AiContextProvider, Chatbot } from '@ethings-os/sdk-ui/ai';

function App() {
  return (
    <SisenseContextProvider {...sisenseContextProps}>
      <AiContextProvider>
        <Chatbot
           width={1000}
           height={800}
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
      </AiContextProvider>
    </SisenseContextProvider>
  );
}
```
