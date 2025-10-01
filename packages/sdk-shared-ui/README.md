### SDK Shared UI Components

The SDK Shared UI is a library of internal React components designed to streamline development for frontend developers, primarily focused on use in CSDK-related projects.
The goal is to save developers' time by promoting reuse of existing work, enabling faster feature development, quicker bug resolution, and greater consistency across projects.

### Status of SDK shared UI Components

🚧 In Progress

### Steps for Adding New Components

Follow the Existing Structure: Ensure that the new component follows the same structure and conventions as the existing components in the library.

Unit Tests: Provide unit tests for the new component to ensure it functions correctly.

Storybook Stories: Add Storybook stories for the new component to enable visual testing and documentation.

Update `package.json` (Export Configuration): Add the new component to the export configuration in the package.json file located in the root of the package.

Update `typesVersions` Configuration: Include the new component type in the typesVersions configuration in the `package.json` file located in the root of the package.

### Usage

To use the sdk-shared-ui in your React components import the components you need from the library:

```tsx
// Named import example
import { DEPRECATED_Icon } from '@ethings-os/sdk-shared-ui';

const App = () => {
  return <DEPRECATED_Icon {...props} />;
};

export default App;
```

```tsx
// Default import example from subpath
import DEPRECATED_Icon from '@ethings-os/sdk-shared-ui/DEPRECATED_Icon';

const App = () => {
  return <DEPRECATED_Icon {...props} />;
};

export default App;
```

### Available Scripts

## Build

- `yarn build`
  Builds the library in deployment mode.

- `yarn build:prod`
  Builds the library in production mode.

- `yarn build -p @ethings-os/sdk-shared-ui --verbose`
  Builds only the @ethings-os/sdk-shared-ui package in development mode.
- `yarn build:prod -p @ethings-os/sdk-shared-ui --verbose`
  Builds only the @ethings-os/sdk-shared-ui package in production mode.

## Format

- `yarn format:check`
  Checks the code formatting using Prettier and ESLint.
- `yarn nx:format:check -p @ethings-os/sdk-shared-ui --verbose`
  Checks the code formatting using Prettier and ESLint for this package.
- `yarn format`
  Automatically formats code using Prettier and fixes fixable issues with ESLint.
- `yarn nx:format -p @ethings-os/sdk-shared-ui --verbose`
  Checks the code formatting using Prettier and ESLint for this package.

## Unit Tests

- `yarn test`
  Runs [vitest](https://vitest.dev/) unit tests.
- `yarn nx:test -p @ethings-os/sdk-shared-ui --verbose`
  Runs unit tests for the @ethings-os/sdk-shared-ui package.

- `yarn test:watch`
  Runs unit tests in watch mode using Vitest.

- `yarn workspaces foreach --include @ethings-os/sdk-shared-ui run test:watch`
  Runs unit tests in watch mode specifically for the @ethings-os/sdk-shared-ui package.

- `yarn test:coverage`
  Runs unit tests with coverage reporting using Vitest.

- `yarn nx:test:coverage -p @ethings-os/sdk-shared-ui --verbose`
  Runs unit tests with coverage reporting specifically for the @ethings-os/sdk-shared-ui package.
