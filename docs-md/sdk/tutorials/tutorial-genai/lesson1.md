---
title: Lesson 1 | Setup
---

# Lesson 1 | Setup

In this lesson, you’ll learn how to set up a new Compose SDK project and display a chatbot in that project. If you've gone through the Charts Tutorial, you'll notice that it's similar to [Lesson 1](../tutorial-charts/lesson1.md).

## Prerequisites

Before getting started, you’ll need:

- Node.js version 16 or higher
- npm

You’ll also need access to a Sisense instance with:

- The Sample Retail and Sample ECommerce data sources (you may need to go into each data model and unhide some of the columns that are hidden by default)
- An [API Token](../../getting-started/authentication-security.md#api-token) you can use to query with
- [CORS settings](../../getting-started/authentication-security.md#set-up-cors) that allow requests from `http://localhost:5173`, the URL that Vite serves your project on locally
- [GenAI enabled](https://docs.sisense.com/main/SisenseLinux/genai.htm#EnablingGenAI)

## Create a project

Let’s start by creating a React project and installing dependencies. We’ll use Vite to create a new project.

1. Navigate to the directory where you want to create your project
1. Run `npm create vite@latest`
1. Name your project `compose-sdk-genai-tutorial` when prompted
1. Select `React` as the framework
1. Select `TypeScript` as the variant
1. Run `cd compose-sdk-genai-tutorial` to navigate to your project directory
1. Run `npm install` to install your project and dependencies
1. Run `npm i @ethings-os/sdk-ui @ethings-os/sdk-data` to install Sisense packages

## Add context providers

Now we can start writing our first bit of code.

Since most of our Compose SDK functionality needs access to a Sisense instance, the first thing we need to do is set up that access with `<SisenseContextProvider>`. There are a number of places you can choose to add it. Here, we’ll add the provider in `main.tsx`.

In `main.tsx`, import the `SisenseContextProvider` from the `sdk-ui` module:

```ts
import { SisenseContextProvider } from '@ethings-os/sdk-ui';
```

Wrap the `<App>` component with a `<SisenseContextProvider>` like this:

```ts
<SisenseContextProvider
  url={import.meta.env.VITE_APP_SISENSE_URL}
  token={import.meta.env.VITE_APP_SISENSE_TOKEN}
>
  <App />
</SisenseContextProvider>
```

This will read the Sisense instance URL and API Token from an `.env`, so let’s add that file now.

1. Create a file named `.env.local` in your project’s root directory
1. Add a `VITE_APP_SISENSE_URL` variable and set its value to your Sisense instance’s URL
1. Add a `VITE_APP_SISENSE_TOKEN` variable and set it value to your API Token

Your `.env.local` file should look something like this:

```
VITE_APP_SISENSE_URL="http://myinstanceurl/"
VITE_APP_SISENSE_TOKEN="OiJhbGJeyciIUzI1..."
```

You'll also need the `<AiContextProvider>`. This is required for using any of the components exported from `@ethings-os/sdk-ui/ai`.

In `main.tsx`, import the `SisenseContextProvider` from the `sdk-ui/ai` namespace:

```ts
import { AiContextProvider } from '@ethings-os/sdk-ui/ai';
```

This component internally uses the `SisenseContextProvider`, so we'll go ahead and nest this provider in between our `<SisenseContextProvider>` and `<App>` components.

```ts
<SisenseContextProvider
  url={import.meta.env.VITE_APP_SISENSE_URL}
  token={import.meta.env.VITE_APP_SISENSE_TOKEN}
>
  <AiContextProvider>
    <App />
  </AiContextProvider>
</SisenseContextProvider>
```

## Add a chatbot

Finally, with all the setup out of the way, we can add a chatbot to our project.

In the `App.tsx` file, import the `<Chatbot>` component.

Note: From here on in we won’t mention imports anymore. Just know that you’ll need to add the appropriate imports as we continue to add code to our project.

```ts
import { Chatbot } from '@ethings-os/sdk-ui/ai';
```

Then, replace the contents of the `App()` function with the following code to render a basic chatbot.

```ts
return (
  <Chatbot />
);
```

## Run

Use the `npm run dev` command to get your project up and running so you can see it in action.
Navigate to `http://localhost:5173` in a browser to see your chatbot. It should look like this:

![First chatbot](../../img/tutorial-genai/1-first-chatbot.png 'First chatbot')

Nice! We now have a chatbot that shows available data topics. Clicking on a data topic will start a chat with that data model/perspective as the chat context.

## Up next

In the next lesson, you'll learn how to customize the chatbot and render multiple chatbots on the same page. [Go to Lesson 2](./lesson2.md).
