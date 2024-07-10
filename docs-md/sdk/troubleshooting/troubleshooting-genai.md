# GenAI Troubleshooting

This troubleshooting guide provides possible answers to common issues that may arise when using the Compose SDK GenAI components.

::: warning Note
This feature is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements. We’re excited to work closely with customers who are eager to get hands-on, test, and help shape this game-changing feature.

To be considered for the beta program, please sign up at [www.sisense.com/get/gen-ai-partner](https://www.sisense.com/get/gen-ai-partner/).
:::

## Component Errors

Here are some common errors that you may encounter.

#### Blank screen with Uncaught SyntaxError: The requested module [...] does not provide an export named 'AiContextProvider'

Check that you are importing from `@sisense/sdk-ui/ai` and not `@sisense/sdk-ui`.

#### Error: No QueryClient set, use QueryClientProvider to set one

Check that your app is wrapped in an `AiContextProvider`.

#### `<Chatbot />` shows infinite loading icon

Check that your app is wrapped in an `AiContextProvider`.
