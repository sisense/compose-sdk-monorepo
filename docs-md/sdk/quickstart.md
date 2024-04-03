---
title: Quickstart Guide (React)
---

# Compose SDK with React: Quickstart Guide

Follow this guide to get started developing applications with Compose SDK.

>**Note**:
>This guide is for [<img src="./img/react-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 3px" /> React](./quickstart). We also have a Quickstart Guide for [<img src="./img/angular-logo.png" height="18px" style="vertical-align: text-bottom; padding-bottom: 2px" /> Angular](./quickstart-angular)
> and [<img src="./img/vue-logo.png" height="14px" /> Vue](./quickstart-vue) (beta).
## Prerequisites

Compose SDK contains a set of React components needed to interface with your Sisense instance. The following prerequisites are needed in order to use the SDK:

1. Familiarity with [front-end web development](https://developer.mozilla.org/en-US/docs/Learn/Front-end_web_developer), including Node.js, JavaScript/TypeScript, and React.
2. [Node.js](https://nodejs.org/en) version **16** or higher.
3. [React](https://react.dev) version **16.14.0**, **17**, or **18**.
4. A Node package manager such as [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [Yarn](https://yarnpkg.com/getting-started/install).
5. Access to a [Sisense](https://sisense.com) instance with a queryable data source (for example, Sample ECommerce).
6. React application **with TypeScript**. You can use your existing application, or if you do not have one, you can follow the [Vite tutorial](https://vitejs.dev/guide/#scaffolding-your-first-vite-project) to create one.

## Quickstart Application Setup

For this quickstart guide we will use the `Vite` project.

If you want to use your own application, skip to [Installing the SDK packages](#installing-the-sdk-packages).

> **Note:**
>
> When creating your Vite project, select the React framework and TypeScript.

Follow the instructions on the [Scaffolding Your First Vite Project](https://vitejs.dev/guide/#scaffolding-your-first-vite-project) page.

Navigate to your project and install the dependencies.

<div style="display: flex; margin-right: 10px;">
  <div style="flex: 1; overflow-x: auto; max-width: calc(50% - 5px);">

For npm:

```sh
npm install
```
  </div>
  <div style="flex: 1; margin-left: 10px; overflow-x: auto; max-width: calc(50% - 5px);">

For Yarn:

```sh
yarn
```
  </div>
</div>

To run the Vite application, use:

<div style="display: flex; margin-right: 10px;">
  <div style="flex: 1; overflow-x: auto; max-width: calc(50% - 5px);">

For npm:

```sh
npm run dev
```
  </div>
  <div style="flex: 1; margin-left: 10px; overflow-x: auto; max-width: calc(50% - 5px);">

For Yarn:

```sh
yarn dev
```
  </div>
</div>

## Installing the SDK Packages

Compose SDK contains three packages for public use:

- [@sisense/sdk-ui](https://www.npmjs.com/package/@sisense/sdk-ui): React components and hooks for rendering charts and executing queries against a Sisense instance.
- [@sisense/sdk-data](https://www.npmjs.com/package/@sisense/sdk-data): Implementations of dimensional modeling elements including dimensions, attributes, measures, and filters.
- [@sisense/sdk-cli](https://www.npmjs.com/package/@sisense/sdk-cli): A command-line tool for generating TypeScript representation of a Sisense data model.

The Compose SDK packages are deployed via public NPM Registry. To install `@sisense/sdk-ui` and `@sisense/sdk-data` for your app:

<div style="display: flex; margin-right: 10px;">
  <div style="flex: 1; overflow-x: auto; max-width: calc(50% - 5px);">

For npm:

```sh
npm i @sisense/sdk-ui @sisense/sdk-data
```
  </div>
  <div style="flex: 1; margin-left: 10px; overflow-x: auto; max-width: calc(50% - 5px);">

For Yarn:

```sh
yarn add @sisense/sdk-ui @sisense/sdk-data
```
  </div>
</div>

Package `@sisense/sdk-cli` is not needed to run your app. It will be installed on the fly as you execute CLI commands using [npx](https://docs.npmjs.com/cli/v10/commands/npx).

### Change package registry from GitHub Packages to public NPM

Starting from version `0.11.3`, Compose SDK packages and their dependencies are hosted on the public NPM registry,
instead of the GitHub Packages Registry (GPR). For existing projects that are installing SDK packages from GPR,
below are simple steps to switch to public NPM:

For npm:

1. Remove the following lines in `.npmrc`:

```
@sisense:registry=https://npm.pkg.github.com
always-auth=true
//npm.pkg.github.com/:_authToken=[YOUR_TOKEN]
```

2. Remove directory `node_modules` and file `package-lock.json` before running `npm install`.

For Yarn 2+:

1. Remove the following lines in `.yarnrc.yml`:

```
npmScopes:
  sisense:
    npmRegistryServer: "https://npm.pkg.github.com"
    npmAlwaysAuth: true
    npmAuthIdent: "[YOUR_GITHUB_USERNAME]:[YOUR_TOKEN]"
```

2. Remove directory `node_modules` and file `yarn.lock` before running `yarn install`.


## Sisense Authentication and Security

In order to retrieve data, you need to authenticate your application with your Sisense instance and set up CORS.

### Authentication

There are a number different ways you can authenticate your application. To learn more, see [Authentication and Security](./authentication-security.md#authentication).

Here, we'll use an API Token that we retrieve using the Compose SDK tool. To do so, run the `get-api-token` command:

```sh
npx @sisense/sdk-cli@latest get-api-token --url <your_instance_url> --username <username>
```

Hold on to the API Token. You'll need it later when adding Compose SDK code to your application.

### CORS Settings

There are also a number of different ways you can set up CORS. To learn more, see [Authentication and Security](./authentication-security.md#cross-origin-resource-sharing-cors).

Here we'll use the Sisense UI. To do so, in your Sisense instance, go to **Admin > Security & Access > Security Settings > General** and add your application's domain to the **CORS Allowed Origins** list.

## Adding Sisense to Your Application

This section describes how to add Compose SDK to your application to render charts from data in your Sisense instance.

### Generating a Data Model Representation

To visualize data in your application using Compose SDK, first make sure you have a [data model](https://docs.sisense.com/main/SisenseLinux/introduction-to-data-models.htm?Highlight=create%20a%20data%20model%20within%20Sisense) in your Sisense instance. Then, create a TypeScript representation of it in your project. This is done using the CLI command which automatically generates it, or you can create it manually using the same syntax.

Once you have a TypeScript representation of your data model, you define measures, dimensions and filters and easily create sophisticated queries. There is no need to specify complex `JOINS` relationships or `GROUP BYS` that you do when using SQL and other query languages because the Sisense semantic [query engine](https://docs.sisense.com/main/SisenseLinux/analytical-engine-overview.htm) will do that for you.

Run the following command to create a `sample-ecommerce.ts` file in directory `src/` of the application. The file contains a TypeScript representation of the Sample ECommerce data model.

```sh
npx @sisense/sdk-cli@latest get-data-model --username "<username>" --output src/sample-ecommerce.ts --dataSource "Sample ECommerce" --url <your_instance_url>
```

Enter your password to complete the command and generate the data model representation.

> **Note:**
> You can use other authentication methods such as WAT (`--wat "<your_token>"`), or API token (`--token "<your_API_token>"`) when generating the data model representation.

The resulting file, which is created in the `src/` directory, should look something like below:

```ts
import type { Dimension, DateDimension, Attribute } from '@sisense/sdk-data';
import { createAttribute, createDateDimension, createDimension } from '@sisense/sdk-data';

export const DataSource = 'Sample ECommerce';

interface BrandDimension extends Dimension {
  Brand: Attribute;
  BrandID: Attribute;
}
export const Brand = createDimension({
  name: 'Brand',
  Brand: createAttribute({
    name: 'Brand',
    type: 'text-attribute',
    expression: '[Brand.Brand]',
  }),
  BrandID: createAttribute({
    name: 'BrandID',
    type: 'numeric-attribute',
    expression: '[Brand.Brand ID]',
  }),
}) as BrandDimension;
```

This works for any data model, including models you create. Just replace `"Sample ECommerce"` with the name of your data model.

## Embedding a Chart in your Application

In this section, you will modify the main `app` component to embed a chart visualizing data from the Sample ECommerce data source.

Use the two components, `SisenseContextProvider` and `Chart`, from `@sisense/sdk-ui` along with the `measureFactory` and `filterFactory` utilities from `@sisense/sdk-data`.

> **Note:**
> The following assumptions are made about your application:
>
> - The `src/App.tsx` file is the main React component.
> - The `sample-ecommerce.ts` file generated earlier resides in `src/`.
> - The URL to your application (f.e. http://localhost:5173) is already added as an entry to CORS Allowed Origins section on your Sisense instance. If not, you can do so on your Sisense instance by going to _Admin_, then _Security Settings_.

### Connecting to a Sisense Instance

The `SisenseContextProvider` component contains all relevant information about the Sisense instance and ensures it is available to all nested Compose SDK components. In other words, this is a wrapper for your application so that all the components are able to access the data. The authentication method used to access your Sisense instance is also defined in this component.

The following examples shows how to add `SisenseContextProvider` to `src/App.tsx`. Make sure that all the other SDK components you want to use are nested inside the `SisenseContextProvider` component.

```ts
// src/App.tsx

import { SisenseContextProvider } from '@sisense/sdk-ui';

function App() {
  return (
    <>
      <SisenseContextProvider
        url="<instance url>" // replace with the URL of your Sisense instance
        token="<api token>" // replace with the API token of your user account
      ></SisenseContextProvider>
    </>
  );
}
export default App;
```

> **Note:**
> The above example uses the API token (also called _bearer authentication_) to connect to a Sisense instance. To generate an API token for your Sisense user account, see the Sisense Instance Authentication section above. The `SisenseContextProvider` also supports other authentication mechanisms including WAT and SSO.

### Adding a chart

To render a chart in your application that queries your data model, use the `Chart` component, the `measureFactory` and `filterFactory` utilities, and your previously generated data model file.

Use the `dataOptions` property (`ChartProps` interface) to assign table columns or attributes from your data model to the categories and values of a chart. This is similar to the **Data** panel in the **Sisense Widget Editor**, where you can drag and drop columns to the **Categories**, **Values**, and **Break By** fields. For example, if you wanted to render a line chart with `Age Range` on the X-axis and a sum aggregation of `Revenue` on the Y-axis, your `dataOptions` object would look like:

```ts
// chartType={'line'}
{
  category: [DM.Commerce.AgeRange],
  value: [measureFactory.sum(DM.Commerce.Revenue)],
  breakBy: [],
}
```

> **Note**
> Use `measureFactory.sum()` from the example above to specify the `sum` type aggregation on the `Revenue` category. This `measureFactory` utility is exported from the `@sisense/sdk-data` library and supports other aggregation types. See the [`measureFactory`](./modules/sdk-data/namespaces/namespace.measureFactory/index.md) documentation for more information.

The following is a complete example of a rendered chart in an application.

```ts
// src/App.tsx

import { Chart, SisenseContextProvider } from '@sisense/sdk-ui';
import * as DM from './sample-ecommerce';
import { measureFactory } from '@sisense/sdk-data';

function App() {
  return (
    <>
      <SisenseContextProvider
        url="<instance url>" // replace with the URL of your Sisense instance
        token="<api token>" // replace with the API token of your user account
      >
        <Chart
          dataSet={DM.DataSource}
          chartType={'line'}
          dataOptions={{
            category: [DM.Commerce.AgeRange],
            value: [measureFactory.sum(DM.Commerce.Revenue)],
            breakBy: [],
          }}
          styleOptions={{
            legend: {
              enabled: true,
              position: 'bottom',
            },
          }}
          onDataPointClick={(point, nativeEvent) => {
            console.log('clicked', point, nativeEvent);
          }}
        />
      </SisenseContextProvider>
    </>
  );
}

export default App;
```

Your chart should look like this:

![Line chart rendered by the Chart component](./img/chart-data-source-example-2.png)

See the [SisenseContextProvider](./modules/sdk-ui/contexts/function.SisenseContextProvider.md) and [Chart](./modules/sdk-ui/charts/function.Chart.md) docs for more details on supported props.

## Next Steps

The sample application in this quickstart guide is designed to give you a basis for what you can do with Compose SDK. Build on the code sample by using other components from Compose SDK to add Sisense analytical experiences to your applications.

Check out our demo application for Compose SDK with [React](https://csdk-react.sisense.com).
