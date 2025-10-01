# Generative AI Troubleshooting

This troubleshooting guide provides possible answers to common issues that may arise when using the Compose SDK Generative AI components.

::: tip Note
For more information on requirements for enabling Generative AI features, please refer to the [Generative AI documentation](https://docs.sisense.com/main/SisenseLinux/genai.htm)
:::

## Component Errors

Here are some common errors that you may encounter.

#### Blank screen with Uncaught SyntaxError: The requested module [...] does not provide an export named 'AiContextProvider'

Check that you are importing from `@ethings-os/sdk-ui/ai` and not `@ethings-os/sdk-ui`.

#### Error: No QueryClient set, use QueryClientProvider to set one

Check that your app is wrapped in an `AiContextProvider`.

#### `<Chatbot />` shows infinite loading icon

Check that your app is wrapped in an `AiContextProvider`.
