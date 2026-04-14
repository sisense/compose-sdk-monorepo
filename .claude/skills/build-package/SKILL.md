---
name: build-package
description: Build a specific SDK package using NX with automatic dependency resolution. Use when you need to build one package, check build output, or rebuild after source changes.
argument-hint: <package-name>
allowed-tools: Bash(yarn nx *) Bash(yarn workspace *) Bash(yarn build) Bash(yarn clean) Bash(yarn install)
---

# Build a Package

Package: **$ARGUMENTS**

---

## Standard build

```bash
yarn nx run @sisense/$ARGUMENTS:build
```

NX resolves `dependsOn: ['^build']` and builds all upstream packages first. Results are cached — repeated builds on unchanged code are instant.

## Production build

```bash
yarn nx run @sisense/$ARGUMENTS:build:prod
```

Required before `test:coverage` or component tests (`dependsOn: ['^build:prod']`).

## Type-check only (fastest feedback)

```bash
yarn workspace @sisense/$ARGUMENTS type-check
```

Runs `tsc --noEmit`. Much faster than a full build. Use this during development.

---

## Broader build scopes

```bash
# Affected packages only (since master)
yarn nx:build:af

# All packages
yarn build

# Clean build (when artifacts are stale or deps changed)
yarn clean && yarn install && yarn build
```

## Discover available package names

```bash
yarn nx show projects --exclude @sisense/root
```

Core packages: `sdk-data`, `sdk-ui`, `sdk-ui-angular`, `sdk-ui-vue`, `sdk-ui-preact`, `sdk-common`, `sdk-rest-client`, `sdk-query-client`, `sdk-modeling`, `sdk-pivot-ui`, `sdk-shared-ui`, `sdk-tracking`, `sdk-cli`

---

## Troubleshooting

**Stale artifacts or dependency errors** — clean and rebuild:

```bash
yarn clean && yarn install && yarn build
```

**Type errors** — type-check gives cleaner output than the full build:

```bash
yarn workspace @sisense/$ARGUMENTS type-check
```

**Build outputs** land in `packages/$ARGUMENTS/dist/`:

- ESM: `dist/index.js`
- CJS: `dist/cjs/index.js`
- Types: `dist/types/`

Note: `sdk-data` uses `tsc` directly (not Vite) — its output structure differs slightly.
