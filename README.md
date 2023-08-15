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
git clone git@gitlab.sisense.com:SisenseTeam/compose-sdk-monorepo.git
cd compose-sdk-monorepo
yarn install
yarn build
```

(First installation and build may take a few minutes to complete.)

Note that if you need to set up your machine to work with `git`,
[this article](https://sisenseglobal.atlassian.net/wiki/spaces/DSP/pages/8995772068/Setting+up+Git+on+a+New+Computer)
could be helpful.

If needed, run the following commands in your CLI tool to verify your Yarn and Node.js versions:

```sh
yarn -v

node -v
```

## Run the Storybook (`@sisense/sdk-ui`)

The Storybook contains chart examples of different chart types and configurations.
These examples do not need a Sisense instance to run.

From `packages/sdk-ui`, run:

```sh
yarn storybook
```

## Run the React Demo App

The React Demo App, which is located at directory `examples/react-ts-demo`, contains pages that demonstrate
embedded Compose SDK components (e.g., `ExecuteQuery`, `Chart`, `DashboardWidget`) in a variety of real-world use cases.

### Set up a Sisense instance

The Demo App needs a working Sisense instance to query data sources or replicate existing dashboard widgets.
If you have access to R&D Jenkins, you can
spin up a dev Sisense instance at https://jenkins.corp.sisense.com/job/sisense_product/job/Global/job/Deploy_Sisense/.

Once the instance is deployed, login with the `admin@sisense.com` account to activate it
-- those credentials are hard-coded by default in the demo app.

Once activated, add the following entry to [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
Allowed Origins section on your instance by going to Admin → Security Settings:

```
http://localhost:5173
```

The above URL is the default URL for the React demo app.

### Configure `.env.local` file

The `.env.local` file contains configurations specific to your React demo app,
which may include username and password of an account to access the Sisense instance set up earlier.
For that reason, the file does not exist in the monorepo in Gitlab.
An example file, `examples/react-ts-demo/.env.local.example`, is provided for reference.
Copy the example file to `.env.local` in the same directory and update the values as instructed in that file.

### Start the App

Now from your `compose-sdk-monorepo` directory, simply start the React demo app with:

```sh
yarn workspace react-ts-demo dev
```

Or within the `examples/react-ts-demo` directory, run:

```sh
yarn dev
```

Open your favorite browser and go to http://localhost:5173 to access the app.
