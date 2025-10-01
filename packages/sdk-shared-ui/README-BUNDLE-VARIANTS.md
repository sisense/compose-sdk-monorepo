# SDK Shared UI Bundle Variants

The `@ethings-os/sdk-shared-ui` library provides two bundle variants to accommodate different use cases:

## Bundle Variants

### 1. Bundled Variant (Default)

The default variant includes all dependencies bundled within the library. Built to `dist/`.

**Use case:**

- When you want a self-contained library with minimal setup
- When you don't use @mui/material or @emotion in your application
- When bundle size is not a critical concern

### 2. Lightweight Variant

The lightweight variant excludes @mui/material and @emotion packages from the bundle, expecting them to be provided by the consuming application. Built to `dist/lightweight/`.

**Use case:**

- When your application already uses @mui/material and @emotion libraries
- When you want to reduce bundle size and avoid dependency duplication
- When you need maximum performance and minimal bundle size

## Bundle Size Comparison

| Component              | Bundled Variant | Lightweight Variant | Size Reduction |
| ---------------------- | --------------- | ------------------- | -------------- |
| TablePagination        | 229KB           | 10KB                | 95.6%          |
| emotion-cache-provider | 185KB           | 578B                | 99.7%          |

## Configuration in Your App

To use the lightweight variant, configure your bundler to resolve `@ethings-os/sdk-shared-ui` to the lightweight build:

### Webpack Configuration

```javascript
module.exports = {
  resolve: {
    alias: {
      '@ethings-os/sdk-shared-ui': path.resolve(
        __dirname,
        'node_modules/@ethings-os/sdk-shared-ui/dist/lightweight',
      ),
    },
  },
};
```

### Vite Configuration

```javascript
export default {
  resolve: {
    alias: {
      '@ethings-os/sdk-shared-ui': path.resolve(
        __dirname,
        'node_modules/@ethings-os/sdk-shared-ui/dist/lightweight',
      ),
    },
  },
};
```

### TypeScript Configuration

Add path mapping to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@ethings-os/sdk-shared-ui": ["./node_modules/@ethings-os/sdk-shared-ui/dist/lightweight"]
    }
  }
}
```

## Required Dependencies

When using the lightweight variant, ensure your application includes these peer dependencies:

```json
{
  "dependencies": {
    "@mui/material": "^5.x.x",
    "@mui/utils": "^5.x.x",
    "@emotion/react": "^11.x.x",
    "@emotion/cache": "^11.x.x"
  }
}
```

## Build Commands

- `yarn build` - Build both bundled and lightweight variants (development mode)
- `yarn build:prod` - Build both bundled and lightweight variants (production mode)

Both commands automatically generate:

- Bundled variant in `dist/`
- Lightweight variant in `dist/lightweight/`

## Migration Guide

### From Bundled to Lightweight

1. Add the required @mui/@emotion dependencies to your project
2. Configure your bundler to use `dist/lightweight/`
3. Add TypeScript path mapping if using TypeScript
4. Test that all imports work correctly

### From Lightweight back to Bundled

1. Remove the bundler alias configuration
2. Remove TypeScript path mapping
3. Optionally remove @mui/@emotion dependencies if not used elsewhere
