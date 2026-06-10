# Sisense CSDK Plugins Repository

This is a base React + TypeScript + Vite repository for building CSDK plugins.

## Features

- React 18+ with TypeScript
- Vite for fast development and building
- sdk-ui library is pre-configured
- Cross-framework support — plugins work in React, Angular, and Vue host apps
- ESLint and Prettier configured
- Vitest for unit testing
- Built-in CLI command for plugin deployment

## Getting Started

### Prerequisites

- Node.js 18.16.0+
- npm, yarn or another package manager. Examples are provided with npm

### Installation

Install the dependencies:

```bash
npm install
```

### Connecting to Sisense

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
VITE_APP_SISENSE_URL=https://your-sisense-instance.com
VITE_APP_SISENSE_TOKEN=your-api-token-here
```

The API token can be generated with `npx @sisense/sdk-cli get-api-token`.

To deploy the plugin to your Sisense Fusion instance, use an API token for a user with the 'Admin' role.

## Development

### Start Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:3000` to test your plugin.
Sisense instance should be configured to allow CORS from `http://localhost:3000`.

## Testing

Run unit tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Building

Build the plugin for production:

```bash
npm run build
```

Build for Sisense Fusion deployment:

```bash
npm run build:fusion
```

## Deployment

Deploy your plugin to Sisense:

```bash
npm run deploy
```

This requires a valid Sisense connection (see "Connecting to Sisense" above).

## Code Quality

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
npm run format:check
```

## Project Structure

```text
.
├── src/
│   ├── components/
│   │   ├── Visualization.tsx     # Main visualization component
│   │   ├── DesignPanel.tsx       # Configuration panel shown in the design sidebar
│   ├── dev-preview-props.ts      # Sample props used by the dev preview app
│   ├── types.ts                  # TypeScript types for the plugin's props and options
│   ├── index.tsx                 # Plugin entry point; registers the plugin with metadata and data panel config
│   └── vite-env.d.ts             # Vite type declarations
├── dev/                          # Development app (served by `npm run dev`)
│   ├── index.html                # Dev app entry HTML
│   ├── main.tsx                  # Dev app entry point
│   ├── models/                   # Sample data models
│   └── vitest.setup.ts           # Vitest global setup
├── .env.local                    # Environment variables (gitignored)
├── .env.local.example            # Template for .env.local
├── vite.config.ts                # Vite / Vitest configuration
└── package.json                  # Project configuration
```

## Cross-Framework Support

Built plugins expose separate entry points for Angular and Vue host apps:

| Import path           | Used by           |
| --------------------- | ----------------- |
| `your-plugin`         | React host apps   |
| `your-plugin/angular` | Angular host apps |
| `your-plugin/vue`     | Vue host apps     |

## Dependencies

- `@sisense/sdk-data` — Data modeling and querying
- `@sisense/sdk-ui` — UI components and context providers
- `@sisense/sdk-plugins-dev` — Plugin development tooling (Vite plugin, dev app, deploy script)
- `react` & `react-dom` — React framework

## Next Steps

1. Start developing: `npm run dev`
2. Test your plugin in the development app
3. Run tests: `npm run test`
4. Build and deploy: `npm run deploy`
