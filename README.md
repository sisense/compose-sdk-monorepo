# Compose SDK Monorepo

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

You can find more information about setting up an app using this SDK in quickstart.md
