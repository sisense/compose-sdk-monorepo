# Compose SDK Monorepo

Compose SDK is a Software Development Kit that enables a composable, code-driven way to use Sisense platform capabilities. Build analytics and data-driven experiences into your product with code using Compose SDK, a set of client-side libraries and components for query composition, data visualization, and more.

- **Create Sisense queries, charts, and filters directly from your application code**
  No predefined dashboards or widgets required - or render existing widgets by ID. Mix and match approaches to fit your needs.
- **Composable, modular and extensible**
  Use our components, customize them, or bring your own. Compose SDK works equally well for building new applications or upgrading existing ones to use Sisense’s powerful analytics platform.
- **Built with developer experience in mind**
  The SDK is available via GitHub and NPM, supports Typescript and React, and includes documentation, code samples and CLI tools that help you get things done with ease.

## What you need to know

- Compose SDK requires a Sisense license & access to a Sisense instance
- Compose SDK supports Sisense version L2022.11 or newer
- Compose SDK currently supports development using JavaScript/Typescript and React
- This repository is a monorepo containing all SDK packages. You can find the individual packages [here](https://www.npmjs.com/search?q=%40sisense%2Fsdk)

## Documentation

You can find documentation for Compose SDK on the [Sisense Developer Portal](https://sisense.dev).

A demo application for Compose SDK + Typescript + React is available at https://csdk-react.sisense.com/. The source code repo is at [compose-sdk-react-demo](https://github.com/sisense/compose-sdk-react-demo).

## Overview of Development Tools

This project uses [Yarn 3](https://github.com/yarnpkg/berry) for package management,
[Yarn workspaces](https://yarnpkg.com/features/workspaces) for monorepo management,
and [the Yarn version plugin](https://yarnpkg.com/features/release-workflow) for versioning/publishing.

Using [Volta](https://docs.volta.sh/guide/getting-started) as
your Node.js version manager is **strongly** recommended, but Node Version Manager `nvm` is also supported.
Currently, the project is tested with Node.js 18.16.0 or newer.

## Installation

Clone the repo, move to the repo directory, install dependencies, and build the project:

```sh
cd compose-sdk-monorepo
yarn install
yarn build
```

(First installation and build may take a few minutes to complete.)

## Run the Storybook (`@sisense/sdk-ui`)

The Storybook contains chart examples of different chart types and configurations.
These examples do not need a Sisense instance to run.

From `packages/sdk-ui`, run:

```sh
yarn storybook
```

### Set up another app

You can find more information about setting up an app using this SDK in [quickstart.md](./docs-md/sdk/quickstart.md) or [quickstart-angular.md](./docs-md/sdk/quickstart-angular.md).
